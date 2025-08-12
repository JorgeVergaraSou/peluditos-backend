import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';
import { AppService } from './app.service';
import { ProductosModule } from './productos/productos.module';
import { PedidosModule } from './pedidos/pedidos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que la configuración esté disponible en todo el proyecto
    }),
    // Registrar WinstonModule globalmente con tu configuración
    WinstonModule.forRoot(winstonConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get<'mysql'>('DB_TYPE'),
        host: configService.get<string>('HOST'),
        port: configService.get<number>('PORT'),
        username: configService.get<string>('USER_DB_NAME'),
        password: configService.get<string>('USER_DB_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        timezone: '-03:00', // manualmente
        dateStrings: ['DATE'],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProductosModule,
    PedidosModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}