import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, LoggerService } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {} // Cambiamos el tipo a LoggerService

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (typeof exception.getResponse() === 'object'
            ? (exception.getResponse() as any).message
            : exception.getResponse())
        : 'Error interno';

    this.logger.error(
      `HTTP ${status} Error en ${request.method} ${request.url}: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : '',
    );

        // Incluir la traza solo en desarrollo
        const isDev = process.env.NODE_ENV !== 'production';

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
/**
 * @Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (typeof exception.getResponse() === 'object'
            ? (exception.getResponse() as any).message
            : exception.getResponse())
        : 'Error interno';

    this.logger.error(
      `HTTP ${status} Error en ${request.method} ${request.url}: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

 */