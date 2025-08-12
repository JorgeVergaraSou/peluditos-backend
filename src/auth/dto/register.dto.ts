import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { Role } from "../../common/enums/role.enum";

export class RegisterDto {
  /** CLASS VALIDATOR INDICA COMO DEBE COMPORTARSE LA VARIABLE Y LO QUE DEBE RECIBIR */
 /** EL TRANSFORM RECIVE UNA FUNCION DE CALLBACK RECIVE EL VALOR Y LO REGRESA SIN ESPACIOS */
 
  @Transform(({ value }) => value.trim())
  @IsString({ message: 'El NOMBRE debe ser un texto válido' })
  //@MinLength(5, { message: 'El nombre debe tener al menos 5 caracteres' })
  nombre: string;

  @Transform(({ value }) => value.trim())
  @IsString({ message: 'El APELLIDO debe ser un texto válido' })
  //@MinLength(5, { message: 'El nombre debe tener al menos 5 caracteres' })
  apellido: string;

  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  email: string;

  @IsEnum(Role, { message: 'Rol inválido' })
  role: Role;

  @Transform(({ value }) => value.trim())
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
  password: string;

  @IsOptional()
  servicioId?: number;
}
 /* ESTE DTO SIRVE PARA ESTANDARIZAR LA INFO Y PODER REGISTRAR UN NUEVO USUARIO */