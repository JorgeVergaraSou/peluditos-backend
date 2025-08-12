// src/productos/dto/crear-producto.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearProductoDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  precio: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;
}
