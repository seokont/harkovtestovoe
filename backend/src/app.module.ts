import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { createObserveModule } from '@nestjs/observe';
import configuration from './config/configuration.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { User } from './user/user.model.js';
import { Entry } from './entry/entry.model.js';
import { UserModule } from './user/user.module.js';
import { EntryModule } from './entry/entry.module.js';
import { CaptchaModule } from './captcha/captcha.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CommentsQueueModule } from './queue/comments-queue.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'mysql',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        models: [User, Entry],
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
    CacheModule.register({ isGlobal: true, ttl: 30_000 }),
    EventEmitterModule.forRoot({ global: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
        },
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret') ?? 'dev_secret',
        signOptions: {
          // ms.StringValue — narrow string union; cast keeps runtime value intact.
          expiresIn: (config.get<string>('jwt.expiresIn') ?? '7d') as any,
        },
      }),
    }),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
    UserModule,
    EntryModule,
    CaptchaModule,
    UploadsModule,
    AuthModule,
    CommentsQueueModule,
    RealtimeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
