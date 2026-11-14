import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { User } from '../user/user.model.js';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  exports: [SequelizeModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
