// src/pedido/pedido.service.ts

import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import * as nodemailer from 'nodemailer';
import { CrearPreferenciaDto } from './dto/crear-preferencia.dto';

@Injectable()
export class PedidosService {
  private mp: MercadoPagoConfig;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.mp = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

async crearPreferencia(dto: CrearPreferenciaDto) {
  const { productos, cliente } = dto;

  const items = productos.map((prod) => ({
    id: prod.id?.toString() || Date.now().toString(),
    title: prod.nombre,
    unit_price: prod.precio,
    quantity: prod.cantidad,
  }));

    const emailHtml = `
      <h2>Nuevo pedido</h2>
      <p><strong>Nombre:</strong> ${cliente?.nombre || 'No informado'}</p>
      <p><strong>Teléfono:</strong> ${cliente?.telefono || 'No informado'}</p>
      <p><strong>Dirección:</strong> ${cliente?.direccion || 'No informado'}</p>
      <h3>Productos:</h3>
      <ul>
        ${productos
          .map((p) => `<li>${p.nombre} x${p.cantidad} - $${p.precio}</li>`)
          .join('')}
      </ul>
    `;

    // Enviar el email
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_DEST || process.env.EMAIL_USER,
      subject: 'Nuevo pedido - Peluditos Pet',
      html: emailHtml,
    });

    // Crear preferencia en MercadoPago
    const preference = new Preference(this.mp);
    const result = await preference.create({
      body: {
        items,
        back_urls: {
          success: 'http://localhost:5173/pago-exitoso',
          failure: 'http://localhost:5173/pago-fallido',
          pending: 'http://localhost:5173/pago-pendiente',
        },
        // auto_return: 'approved',
      },
    });

    return result;
  }
}
