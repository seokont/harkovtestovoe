import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model.js';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, SequelizeModule],
})
export class UserModule {}
