import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module.js';
import { User } from './user/user.model.js';
import { Entry } from './entry/entry.model.js';
import { EntryModule } from './entry/entry.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Maqim1981!',
      database: 'test',
      models: [User, Entry],
      autoLoadModels: true,
      synchronize: true,
      logging: console.log,
    }),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
    UserModule,
    EntryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
