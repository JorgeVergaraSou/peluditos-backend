// src/pedido/pedido.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CrearPreferenciaDto } from './dto/crear-preferencia.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidoService: PedidosService) { }

  @Post('crear-preferencia')
  async crearPreferencia(@Body() dto: CrearPreferenciaDto) {
    return this.pedidoService.crearPreferencia(dto);
  }
}
