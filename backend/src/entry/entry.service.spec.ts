import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { EntryService } from './entry.service.js';
import { Entry } from './entry.model.js';
import { UserService } from '../user/user.service.js';
import { CaptchaService } from '../captcha/captcha.service.js';

describe('EntryService', () => {
  let service: EntryService;
  const entryModel = { create: vi.fn(), findAll: vi.fn(), findByPk: vi.fn() };
  const userService = { findOrCreate: vi.fn() };
  const captchaService = { verify: vi.fn() };
  const eventEmitter = { emit: vi.fn() };
  const cacheManager = { get: vi.fn(), set: vi.fn(), clear: vi.fn() };
  const jwtService = { signAsync: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntryService,
        { provide: getModelToken(Entry), useValue: entryModel },
        { provide: UserService, useValue: userService },
        { provide: CaptchaService, useValue: captchaService },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: CACHE_MANAGER, useValue: cacheManager },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<EntryService>(EntryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects an invalid CAPTCHA', async () => {
    captchaService.verify.mockReturnValue(false);
    await expect(
      service.create({
        userName: 'John',
        email: 'john@example.com',
        captchaId: 'x',
        captchaAnswer: 'wrong',
        text: 'hi',
      } as never),
    ).rejects.toThrow('Invalid or expired CAPTCHA');
  });
});
