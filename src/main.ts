//main.ts 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { winstonConfig } from './config/winston.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { resolve } from 'path';

async function bootstrap() {

  const winstonLogger = WinstonModule.createLogger(winstonConfig);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: winstonLogger,
  });

app.setGlobalPrefix('peluditos');

app.useStaticAssets(resolve(process.cwd(), 'uploads'), {
  prefix: '/peluditos/uploads/',
});

console.log('STATIC PATH:', join(__dirname, '..', 'uploads'));

  app.useGlobalFilters(new AllExceptionsFilter(winstonLogger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  await app.listen(3006);
}
bootstrap();