import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService],
  controllers: [],
  exports: [UsersService], // SE EXPORTA PARA QUE PUEDA SER USADO POR LA "AUTH"
})
export class UsersModule {}

