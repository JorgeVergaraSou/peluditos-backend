import { Injectable, OnApplicationBootstrap, LoggerService } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private dataSource: DataSource,

    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.dataSource.query('SELECT 1');
      this.logger.log('✅ Conexión exitosa a la base de datos');
    } catch (error) {
      this.logger.error('❌ Falló la conexión a la base de datos', error);
    }
  }
}
