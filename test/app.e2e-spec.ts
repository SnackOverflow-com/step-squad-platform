import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { UserCreateDto } from '../src/web/user/dto/user-create.dto';
import { UserResponseDto } from '../src/web/user/dto/user-response-dto';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('getAllUsers (GET)', () => {
    const createUserRequest = {
      "firstName": "First",
      "lastName": "Last",
      "email": "first.last@gmail.com",
      "age": 22,
      "gender": "MALE",
      "password": "testPassword"
    } as UserCreateDto;

    request(app.getHttpServer()).post('/user')
      .send(createUserRequest)
      .expect(200)
      .expect('Hello World!');

    return request(app.getHttpServer()).get('/user/list')
      .expect(200)
      .expect([{
        "id": 1,
        "firstName": "First",
        "lastName": "Last",
        "email": "first.last@gmail.com"
      } as UserResponseDto]);
  });
});
