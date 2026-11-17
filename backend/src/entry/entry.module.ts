import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Entry } from './entry.model.js';
import { EntryService } from './entry.service.js';
import { EntryController } from './entry.controller.js';
import { UserModule } from '../user/user.module.js';
import { CaptchaModule } from '../captcha/captcha.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    SequelizeModule.forFeature([Entry]),
    UserModule,
    CaptchaModule,
    AuthModule,
  ],
  controllers: [EntryController],
  providers: [EntryService],
})
export class EntryModule {}
