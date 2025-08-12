import { PartialType } from '@nestjs/mapped-types';
import { CrearProductoDto } from './create-producto.dto';

export class UpdateProductoDto extends PartialType(CrearProductoDto) {}
