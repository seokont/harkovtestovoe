import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UserService } from './user.service.js';
import { User } from './user.model.js';

describe('UserService', () => {
  let service: UserService;
  const userModel = {
    findOne: vi.fn(),
    create: vi.fn(),
    findAll: vi.fn(),
    findByPk: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: getModelToken(User), useValue: userModel }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
