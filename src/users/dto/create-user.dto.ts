import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../../common/enums/role.enum";

export class CreateUserDto {

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

    @IsEnum(Role, { message: 'Rol inválido' })
    role: Role;
  
    @IsOptional()
    @IsEmail({}, { message: 'El email debe ser una dirección de correo electrónico válida.' })
    email?: string;
  
    @IsOptional()
    @Transform(({ value }) => value.trim())
    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    password?: string;
    
    @IsOptional()
    idServicio?: number;

}