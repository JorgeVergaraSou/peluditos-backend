import { InternalServerErrorException } from '@nestjs/common';
import { TypeORMError } from 'typeorm';

export function handleServiceError(
  error: any,
  logger: any,
  serviceName: string,
  defaultMessage: string
): never {
  logger.error(`Error en ${serviceName}:`, error.stack || error);
  let errorMessage = defaultMessage;
  if (error instanceof TypeORMError) {
    errorMessage = `Error de TypeORM: ${error.message}`;
  }
  throw new InternalServerErrorException(errorMessage);
}