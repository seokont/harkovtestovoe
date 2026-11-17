import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { EntryController } from './entry.controller.js';
import { EntryService } from './entry.service.js';

describe('EntryController', () => {
  let controller: EntryController;
  const entryService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntryController],
      providers: [
        { provide: EntryService, useValue: entryService },
        { provide: JwtService, useValue: { verifyAsync: vi.fn() } },
      ],
    }).compile();

    controller = module.get<EntryController>(EntryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
