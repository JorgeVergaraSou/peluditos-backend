import { IsString, MinLength, IsEmail, IsOptional } from 'class-validator';
import { Transform } from "class-transformer";

export class UpdateUserDto {
  @IsOptional()
  @Transform(({ value }) => value.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre?: string;

  @IsOptional()
  @Transform(({ value }) => value.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  apellido?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser una dirección de correo electrónico válida.' })
  email?: string;

  @IsOptional()
  @Transform(({ value }) => value.trim())
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'El token de restablecimiento debe ser una cadena de texto.' })
  resetPasswordToken?: string;

  @IsOptional()
  @IsString({ message: 'La contraseña actual debe ser una cadena de texto.' })
  currentPassword?: string;

  @IsOptional()
  servicioId?: number; // Podría ser el ID del servicio
}
