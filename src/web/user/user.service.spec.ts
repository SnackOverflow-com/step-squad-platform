import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './model/user.entity';
import { UserToUserResponseDtoMapper } from './mapper/user-to-user-response-dto-mapper';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
      save: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserToUserResponseDtoMapper,
        {
          provide: Repository<User>,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
