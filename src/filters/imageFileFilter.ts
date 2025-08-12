import { BadRequestException } from '@nestjs/common';

export function imageFileFilter(req: any, file: Express.Multer.File, callback: Function) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return callback(
      new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp).'),
      false,
    );
  }
  callback(null, true);
}
