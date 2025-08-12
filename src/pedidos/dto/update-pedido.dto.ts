import { PartialType } from '@nestjs/mapped-types';
import { CrearPreferenciaDto } from './crear-preferencia.dto';

export class UpdatePedidoDto extends PartialType(CrearPreferenciaDto) {}
