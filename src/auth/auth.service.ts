import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { UserActiveInterface } from "../common/interfaces/user-active.interface";
import { RequestResetPasswordDto } from "./dto/requestResetPassword.dto";
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from "../users/dto/update-user.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { UserEntity } from "../users/entities/user.entity";
import { transporter } from "../config/mailer";
import * as argon2 from 'argon2';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';
import { handleServiceError } from "../common/utils/error-handler.util";
import { insertLogger, selectLogger } from "src/config/db-loggers";

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: WinstonLogger,
    //private readonly serviciosService: ServiciosService
  ) { }

  // auth.service.ts

  async registro({ password, email, nombre, apellido, role }: RegisterDto): Promise<{ message: string, success: boolean }> {

    // Verificar si el usuario ya existe
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      insertLogger.warn(`Registro fallido: email ya existe -> ${email}`);
      throw new HttpException('Email ya existe', HttpStatus.CONFLICT);
    }
    try {
      const hashedPassword = await argon2.hash(password);

      const newUser = await this.usersService.nuevoUsuario({
        nombre,
        apellido,
        role,
        email,
        password: hashedPassword,
      });

      if (!newUser) {
        throw new HttpException('No se pudo crear el usuario', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // 👉 Registrar en archivo insert.log
      insertLogger.info(`Usuario creado: ${JSON.stringify({
        id: newUser.idUser,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        email: newUser.email,
        role: newUser.role,
      })}`);

      return { success: true, message: 'Usuario creado exitosamente' };

    } catch (error) {
      handleServiceError(error, this.logger, 'activarUsuario', 'Ocurrio un error al crear el usuario');
    }
  }
  // --------------- REGISTER FIN ---------------

  /** ----------------- INICIO LOGIN ------------------- */
  async login({ email, password }: LoginDto): Promise<{ token: string }> {
    try {
      // Buscar usuario incluyendo el campo password
      const user = await this.usersService.findByEmailWithPassword(email);
      if (!user) {
        selectLogger.warn(`Login fallido: email no encontrado -> ${email}`);
        // Lanza una excepción de Unauthorized para que el filtro global la maneje
        throw new UnauthorizedException('E-mail inválido');
      }

      // Verificar la contraseña
      const isPasswordValid = await argon2.verify(user.password, password);
      if (!isPasswordValid) {
        selectLogger.warn(`Login fallido: contraseña incorrecta para -> ${email}`);
        throw new UnauthorizedException('Contraseña inválida');
      }
      selectLogger.info(`Login exitoso: ${JSON.stringify({ email: user.email })}`);

      // Crear payload para el JWT (puedes incluir la información necesaria)
      const payload = {
        email: user.email,
        role: user.role,
        idUser: user.idUser,
        name: user.nombre,
      };

      // Generar el token
      const token = await this.jwtService.signAsync(payload);

      return { token };
    } catch (error) {
      // Centralizamos el manejo de errores: se loggea y se lanza una excepción formateada
      handleServiceError(error, this.logger, 'AuthService.login', 'Ocurrió un error al realizar el login');
    }
  }
  /** ===================== FIN LOGIN ===================== */

  /** INICIO RECUPERAR CLAVE */

  async requestResetPasswordByEmail(dto: RequestResetPasswordDto): Promise<{ message: string; success: boolean }> {
    const { email } = dto;

    try {
      const user = await this.usersService.findOneByEmail(email);

      // Delay para proteger contra ataques por tiempo de respuesta
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!user) {
        // Mensaje genérico para no revelar si el email existe
        throw new BadRequestException('Si el email es válido, se enviará un mensaje.');
      }

      const resetPasswordToken = uuidv4();

      const { success } = await this.usersService.updateTokenResetPassword(user.idUser, resetPasswordToken);
      if (!success) {
        this.logger.warn(`No se pudo generar el token para el usuario con email: ${email}`);
        throw new InternalServerErrorException('No se pudo generar el token de recuperación.');
      }

      await transporter.sendMail({
        from: '"Pero que mala memoria 👻" <siguiendolaluna07@gmail.com>',
        to: user.email,
        subject: 'Olvidaste la clave??',
        html: `
          <b>¿Te olvidaste la clave? Hacé clic en el siguiente enlace:</b><br />
          <a href="http://localhost:5173/reset-password?token=${resetPasswordToken}">Recuperar contraseña</a>
        `,
      });

      this.logger.log(`Email de recuperación enviado a: ${email}`);

      return {
        success: true,
        message: 'Si el email es válido, se enviará un mensaje.',
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'AuthService.requestResetPasswordByEmail',
        'Ocurrió un error al procesar la solicitud de reseteo de clave',
      );
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string; success: boolean }> {
    try {
      const { resetPasswordToken, password } = dto;

      const user = await this.usersService.findOneByResetPasswordToken(resetPasswordToken);
      if (!user) {
        throw new BadRequestException('Token inválido o expirado');
      }

      user.password = await argon2.hash(password);
      user.resetPasswordToken = null;

      const result = await this.usersService.nuevoUsuario(user);

      if (!result) {
        throw new InternalServerErrorException('No se pudo actualizar la contraseña');
      }

      this.logger.log(`Contraseña actualizada para el usuario con email: ${user.email}`);
      return {
        success: true,
        message: 'Se ha actualizado la clave correctamente',
      };

    } catch (error) {
      handleServiceError(error, this.logger, 'AuthService.resetPassword', 'Error al actualizar la contraseña');
    }
  }

  /** FIN  RECUPERAR CLAVE*/

  /** INICIO UPDATE USER */
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<{ message: string; success: boolean }> {
    try {
      const result = await this.usersService.updateUser(id, updateUserDto);

      if (result.success && result.fieldsUpdated.length > 0) {
        this.logger.log(`Usuario actualizado (ID: ${id}): ${result.fieldsUpdated.join(', ')}`);
        return {
          message: `Se actualizó: ${result.fieldsUpdated.join(', ')}`,
          success: true,
        };
      }

      this.logger.warn(`No se actualizaron campos para el usuario con ID: ${id}`);
      return {
        message: result.message || 'No se realizaron cambios',
        success: false,
      };
    } catch (error) {
      handleServiceError(error, this.logger, 'AuthService.updateUser', 'Error al actualizar el usuario');
    }
  }


  async findAll(): Promise<{ message: string; success: boolean; users?: UserEntity[] }> {
    try {
      const usersArray = await this.usersService.findAllUsers();

      // Si no hay usuarios, se retorna un objeto indicando que no se encontraron
      if (usersArray.length === 0) {
        return {
          success: false,
          message: 'No se encontraron Usuarios',
        };
      }

      return {
        success: true,
        message: 'Usuarios encontrados',
        users: usersArray,
      };
    } catch (error) {
      handleServiceError(error, this.logger, 'AuthService.findAll', 'Ocurrió un error al buscar los Usuarios');
    }
  }


  async profile(user: UserActiveInterface): Promise<UserEntity> {
    // Buscamos el perfil según el email del usuario activo
    const profile = await this.usersService.findOneByEmail(user.email);
    if (!profile) {
      // Lanza una excepción que será capturada por el filtro global
      throw new NotFoundException('No existe perfil');
    }
    return profile;
  }

  async deleteUser(id: number): Promise<{ message: string; success: boolean }> {
    return await this.usersService.darDeBajaUsuario(id);
  }

  async activarUsuario(id: number): Promise<{ message: string; success: boolean }> {
    return await this.usersService.activarUsuario(id);
  }



}