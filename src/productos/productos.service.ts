import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoEntity } from './entities/producto.entity';
import { CrearProductoDto } from './dto/create-producto.dto';
import { insertLogger, updateLogger } from 'src/config/db-loggers';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ProductosMultiInterfacePromise } from 'src/common/interfaces/productos.interface';
import { UpdateProductoDto } from './dto/update-producto.dto';


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

  // Soft delete
  async desactivarProducto(id: number) {
    const producto = await this.productoRepo.findOne({ where: { idProducto: id } });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    await this.productoRepo.softDelete(id); // 👉 marca deletedAt
    return { message: 'Producto desactivado', idProducto: id };
  }

  // Restaurar soft delete
  async activarProducto(id: number) {
    await this.productoRepo.restore(id); // 👉 borra el deletedAt
    return { message: 'Producto activado', idProducto: id };
  }

  // Listar solo activos
  async listarProductosService() {
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

  // Listar TODOS (incluyendo desactivados)
  async listarTodos() {
     try {
      const productos = await this.productoRepo.find({ withDeleted: true });
      return {
        success: true,
        productos
      };
    } catch (error) {
      insertLogger.error(`Error al listar productos: ${error.message}`);
      throw new InternalServerErrorException('Error al listar los productos');
    }
  }

  async actualizarProducto(id: number, dto: UpdateProductoDto, imagen?: Express.Multer.File) {
    const producto = await this.productoRepo.findOne({ where: { idProducto: id } });
    if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    let tempFilename: string | undefined;
    let tempPath: string | undefined;
    let finalPath: string | undefined;

    if (imagen) {
      tempFilename = imagen.filename;
      tempPath = path.join(process.cwd(), 'uploads', 'temp', tempFilename);
      finalPath = path.join(process.cwd(), 'uploads', 'productos', tempFilename);
    }

    try {
      // Si hay nueva imagen -> borrar la anterior
      if (imagen) {
        if (producto.imagen) {
          const oldImagePath = path.join(process.cwd(), 'uploads', 'productos', producto.imagen);
          if (fs.existsSync(oldImagePath)) {
            await fs.promises.unlink(oldImagePath);
          }
        }
        producto.imagen = tempFilename; // reemplazar nombre de imagen
      }

      // Actualizar campos enviados
      Object.assign(producto, dto);

      await this.productoRepo.save(producto);

      if (imagen && tempPath && finalPath) {
        await this.guardarImagen(tempPath, finalPath);
      }

      updateLogger.info(`Producto actualizado: ${JSON.stringify(producto)}`);
      return { message: 'Producto actualizado con éxito', producto };
    } catch (error) {
      updateLogger.error(`Error al actualizar producto: ${error.message}`);
      if (tempPath) await this.eliminarImagenTemp(tempPath);
      throw new InternalServerErrorException('Error al actualizar producto');
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
