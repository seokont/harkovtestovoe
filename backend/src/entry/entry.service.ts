import { Injectable } from '@nestjs/common';
import { CreateEntryDto } from './dto/create-entry.dto.js';
import { UpdateEntryDto } from './dto/update-entry.dto.js';
import { InjectModel } from '@nestjs/sequelize';
import { Entry } from './entry.model.js';

@Injectable()
export class EntryService {
  constructor(
    @InjectModel(Entry)
    private entryModel: typeof Entry,
  ) {}
  create(createEntryDto: CreateEntryDto) {
    return this.entryModel.create({
      homePage: createEntryDto.homePage ?? '',
      referenceId: createEntryDto.referenceId ?? '',
      text: createEntryDto.text,
    });
  }

  findAll() {
    return this.entryModel.findAll();
  }

  findOne(id: number) {
    return this.entryModel.findByPk(id);
  }

  update(id: number, updateEntryDto: UpdateEntryDto) {
    return this.entryModel.update(updateEntryDto, {
      where: { id },
    });
  }

  remove(id: number) {
    return this.entryModel.destroy({
      where: { id },
    });
  }
}
