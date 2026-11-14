import { Module } from '@nestjs/common';
import { EntryService } from './entry.service.js';
import { EntryController } from './entry.controller.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { Entry } from './entry.model.js';

@Module({
  imports: [SequelizeModule.forFeature([Entry])],
  exports: [SequelizeModule],
  controllers: [EntryController],
  providers: [EntryService],
})
export class EntryModule {}
