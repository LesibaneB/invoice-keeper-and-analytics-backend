import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { CreateAccountDto } from '../src/auth/dto/create-account.dto';
import * as faker from 'faker';
import { AUTH_CREATE_ACCOUNT_ERROR_MESSAGES } from '../src/auth/utils/messages';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: AuthService,
          useFactory: () => ({
            createAccount: jest.fn(),
          }),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/auth/account (POST) should successfully create an account when called with correct payload', () => {
    const password = faker.internet.password();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email(),
      password,
      confirmPassword: password,
    };

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(201);
  });

  it('/auth/account (POST) should fail with appropriate messages to create an account when called with empty password and confirmPassword fields in the payload', () => {
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email(),
      password: '',
      confirmPassword: '',
    };

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          AUTH_CREATE_ACCOUNT_ERROR_MESSAGES.passwordShort,
          AUTH_CREATE_ACCOUNT_ERROR_MESSAGES.passwordShort,
        ],
        error: 'Bad Request',
      });
  });

  it('/auth/account (POST) should fail with appropriate messages to create an account when called with empty firstName and lastName fields in the payload', () => {
    const password = faker.internet.password();
    const createAccountParams: CreateAccountDto = {
      firstName: '',
      lastName: '',
      emailAddress: faker.internet.email(),
      password,
      confirmPassword: password,
    };

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          AUTH_CREATE_ACCOUNT_ERROR_MESSAGES.firstNameEmpty,
          AUTH_CREATE_ACCOUNT_ERROR_MESSAGES.lastNameEmpty,
        ],
        error: 'Bad Request',
      });
  });

  it('/auth/account (POST) should fail with appropriate message to create an account when called with badly formatted email.', () => {
    const password = faker.internet.password();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.name.middleName(),
      password,
      confirmPassword: password,
    };

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(400)
      .expect({
        statusCode: 400,
        message: [AUTH_CREATE_ACCOUNT_ERROR_MESSAGES.emailAddressInvalid],
        error: 'Bad Request',
      });
  });
});
