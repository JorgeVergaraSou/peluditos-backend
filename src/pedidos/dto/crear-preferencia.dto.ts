// src/pedido/dto/crear-preferencia.dto.ts
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductoDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  precio: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsString()
  id?: string;
}

class ClienteDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}

export class CrearPreferenciaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoDto)
  productos: ProductoDto[];

  @ValidateNested()
  @Type(() => ClienteDto)
  cliente: ClienteDto;
}
