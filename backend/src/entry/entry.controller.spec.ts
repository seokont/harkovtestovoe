import { Test, TestingModule } from '@nestjs/testing';
import { EntryController } from './entry.controller.js';
import { EntryService } from './entry.service.js';

describe('EntryController', () => {
  let controller: EntryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntryController],
      providers: [EntryService],
    }).compile();

    controller = module.get<EntryController>(EntryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
