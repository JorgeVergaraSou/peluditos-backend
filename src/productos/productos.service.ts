import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoEntity } from './entities/producto.entity';
import { CrearProductoDto } from './dto/create-producto.dto';
import { insertLogger } from 'src/config/db-loggers';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ProductosMultiInterfacePromise } from 'src/common/interfaces/productos.interface';


@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepo: Repository<ProductoEntity>,
  ) { }

  async crearProducto(dto: CrearProductoDto, imagen: Express.Multer.File) {
    const tempFilename = imagen?.filename;
    const tempPath = path.join(process.cwd(), 'uploads', 'temp', tempFilename);
    const finalPath = path.join(process.cwd(), 'uploads', 'productos', tempFilename);

    // Validación
    if (!dto.nombre || !dto.precio) {
      await this.eliminarImagenTemp(tempPath);
      throw new BadRequestException('Faltan campos requeridos');
    }

    try {
      const producto = this.productoRepo.create({ ...dto, imagen: tempFilename });
      await this.productoRepo.save(producto);
      await this.guardarImagen(tempPath, finalPath);

      insertLogger.info(`Producto creado: ${JSON.stringify(producto)}`);
      return { message: 'Producto creado con éxito', producto };
    } catch (error) {
      insertLogger.error(`Error al crear producto: ${error.message}`);
      await this.eliminarImagenTemp(tempPath);
      throw new InternalServerErrorException('Error al guardar el producto');
    }
  }

  async listarProductosService(): Promise<ProductosMultiInterfacePromise>{

    try {
      const productos = await this.productoRepo.find();
      return {
        success: true,
        productos
      };
    } catch (error) {
      insertLogger.error(`Error al listar productos: ${error.message}`);
      throw new InternalServerErrorException('Error al listar los productos');
    }

  }


  private async guardarImagen(tempPath: string, finalPath: string) {
    return new Promise<void>((resolve, reject) => {
      fs.rename(tempPath, finalPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private eliminarImagenTemp(tempPath?: string) {
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlink(tempPath, (err) => {
        if (err) insertLogger.warn(`No se pudo eliminar imagen temporal: ${tempPath}`);
      });
    }
  }

  private eliminarImagenFinal(finalPath?: string) {
    if (finalPath && fs.existsSync(finalPath)) {
      fs.unlink(finalPath, (err) => {
        if (err) insertLogger.warn(`No se pudo eliminar imagen final: ${finalPath}`);
      });
    }
  }




}
