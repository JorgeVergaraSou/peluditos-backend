import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TypeORMError, UpdateResult } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import * as argon2 from 'argon2';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';
import { handleServiceError } from '../common/utils/error-handler.util';



@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: WinstonLogger,
  ) { }

async nuevoUsuario(createUserDto: CreateUserDto) {
  try {
    return await this.userRepository.save(createUserDto);
  } catch (error) {
    handleServiceError(error, this.logger, 'UsersService.nuevoUsuario', 'Error al crear el Usuario');
  }
}



  /* lo que hace es buscar un usuario por mail y saber si existe */
  async findOneByEmail(email: string): Promise<UserEntity | undefined> {
    return await this.userRepository.findOneBy({ email });
  }

  findOneById(idUser: number) {
    return this.userRepository.findOneBy({ idUser });
  }

  async findOneByResetPasswordToken(resetPasswordToken: string) {
    const user: UserEntity = await this.userRepository.findOneBy({ resetPasswordToken })
    return user;
  }

  /** debido al cambio en la entidad del select false password, implementaremos este metodo
   * haciendo una consulta personalizada quenos traiga el password
   */
  findByEmailWithPassword(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['idUser', 'nombre', 'email', 'role', 'password'],
    });
  }

  findByIdWithPassword(id: number) {
    return this.userRepository.findOne({
      where: { idUser: id },
      select: ['idUser', 'nombre', 'email', 'role', 'password'],
    });
  }
 // ME ENCARGO DE BUSCAR EL SERVICIO ASIGNADO AL USUARIO


  async findAllUsers(): Promise<UserEntity[]> {
    try {
      return await this.userRepository.find({
        withDeleted: true,
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      handleServiceError(error, this.logger, 'UsersService.findAllUsers', 'Ocurrió un error al buscar los Usuarios');
    }
  }


  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<{ success: boolean, message: string, fieldsUpdated: string[] }> {

    const fieldsUpdated = [];

    const userData = await this.findByIdWithPassword(id);

    if (!userData) {
      return {
        message: 'Usuario no encontrado',
        success: false,
        fieldsUpdated
      };
    }

    if (updateUserDto.currentPassword === undefined) {
      return {
        message: 'Debes ingresar tu password actual',
        success: false,
        fieldsUpdated
      };
    }

    // Verificar la contraseña actual con argon2
    const isPasswordValid = await argon2.verify(userData.password, updateUserDto.currentPassword);


    if (!isPasswordValid) {
      return {
        message: 'Password incorrecto',
        success: false,
        fieldsUpdated
      };
    }

    const { currentPassword, ...updateData } = updateUserDto;

    // Verificar siempre que se intenta actualizar el email
    if (updateUserDto.email) {
      const existeEmail = await this.findOneByEmail(updateUserDto.email);


      if (existeEmail) {
        return {
          message: 'Ya se encuentra en uso este E-mail',
          success: false,
          fieldsUpdated

        };
      }

      // Solo agregar a fieldsUpdated si el email es diferente al actual
      if (updateUserDto.email !== userData.email) {
        fieldsUpdated.push('email');
      }
    }

    if (updateUserDto.nombre && updateUserDto.nombre !== userData.nombre) {
      fieldsUpdated.push('nombre');
    }

    if (updateUserDto.password) {
      const hashedPassword = await argon2.hash(updateUserDto.password);
      const comparePaswoord = await argon2.verify(updateUserDto.password, userData.password);

      if (comparePaswoord) {
        return {
          message: 'Tu nueva clave no puede ser igual a la anterior',
          success: false,
          fieldsUpdated

        };
      }
      updateData.password = hashedPassword;
      fieldsUpdated.push('password');
    }

    try {
      const result: UpdateResult = await this.userRepository.update(id, updateData);

      if (result.affected === 0) {
        throw new InternalServerErrorException('No se pudo actualizar');
      } else {
        return {
          message: 'Datos actualizados con éxito',
          fieldsUpdated,
          success: true
        };
      }
    } catch (error) {
      handleServiceError(error, this.logger, 'UserService.updateUser', 'Ocurrió un error al actualizar el usuario');
    }
  }


  async updateTokenResetPassword(id: number, token: string): Promise<{ success: boolean }> {
    const result = await this.userRepository.update(id, { resetPasswordToken: token });

    if (result.affected && result.affected > 0) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
      };
    }
  }

  async darDeBajaUsuario(id: number): Promise<{ success: boolean; message: string }> {
    const user = await this.getUserWithDeleted(id); // Lanza NotFoundException si no existe

    if (user.deletedAt) {
      throw new BadRequestException('El usuario ya está inactivo');
    }
    try {
      await this.userRepository.softDelete(id);
      return { success: true, message: 'Usuario desactivado con éxito' };
    } catch (error) {
      handleServiceError(error, this.logger, 'UsersService.darDeBajaUsuario', 'Ocurrió un error al desactivar el usuario');
    }
  }

  async activarUsuario(id: number): Promise<{ success: boolean; message: string }> {
    const user = await this.getUserWithDeleted(id); // Lanza NotFoundException si no existe

    if (!user.deletedAt) {
      throw new BadRequestException('El usuario ya está activo');
    }
    try {
      await this.userRepository.restore(id);
      return { success: true, message: 'Usuario activado con éxito' };
    } catch (error) {
      handleServiceError(error, this.logger, 'UsersService.activarUsuario', 'Ocurrió un error al activar el usuario');
    }
  }

  // Helper para obtener el usuario, incluyendo los borrados
  private async getUserWithDeleted(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { idUser: id },
      withDeleted: true,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }



}