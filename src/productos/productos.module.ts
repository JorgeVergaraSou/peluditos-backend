// src/productos/productos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { ProductoEntity } from './entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoEntity])],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule {}
