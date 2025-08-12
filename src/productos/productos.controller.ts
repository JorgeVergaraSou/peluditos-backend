import {
  Controller, Post, UploadedFile, UseInterceptors, Body,
  Get
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductosService } from './productos.service';
import { CrearProductoDto } from './dto/create-producto.dto';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { imageFileFilter } from '../filters/imageFileFilter';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) { }

  @Auth(Role.ADMIN)
  @Post('nuevo-producto')
  @UseInterceptors(FileInterceptor('imagen', {
    storage: diskStorage({
      destination: './uploads/temp', // Primero a temp
      filename: (req, file, cb) => {
        const filename = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, filename);
      },
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limita tamaño de foto
  }))
  async crearProducto(
    @UploadedFile() imagen: Express.Multer.File,
    @Body() dto: CrearProductoDto,
  ) {
    return this.productosService.crearProducto(dto, imagen);
  }

  @Get('listar-productos')
  async listarProductos() {
    return this.productosService.listarProductosService();
  }

}
