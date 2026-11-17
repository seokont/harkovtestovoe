import { Module } from '@nestjs/common';
import { CaptchaService } from './captcha.service.js';
import { CaptchaController } from './captcha.controller.js';

@Module({
  controllers: [CaptchaController],
  providers: [CaptchaService],
  exports: [CaptchaService],
})
export class CaptchaModule {}
