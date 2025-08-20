// src/productos/dto/crear-producto.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoriasEnum } from '../../common/enums/categorias.enum';
import { EdadEnum } from '../../common/enums/edad.enum';

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

  @IsOptional()
  @IsEnum(CategoriasEnum)
  categoria?: CategoriasEnum;

  @IsOptional()
  @IsEnum(EdadEnum)
  edad?: EdadEnum;
}
