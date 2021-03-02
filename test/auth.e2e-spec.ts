import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { CreateAccountDto } from '../src/auth/dto/create-account.dto';
import * as faker from 'faker';
import {
  AUTH_CREATE_ACCOUNT_ERROR_MESSAGES,
  LOGIN_UNAUTHORIZED_MESSAGE,
} from '../src/auth/utils/messages';
import {
  closeInMemoryMongoConnection,
  rootMongooseTestModule,
} from '../src/utils/mongo-inmemory-db-handler';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), AppModule],
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

  afterAll(async () => await closeInMemoryMongoConnection());

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
      .expect(400, {
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
      .expect(400, {
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
      .expect(400, {
        statusCode: 400,
        message: [AUTH_CREATE_ACCOUNT_ERROR_MESSAGES.emailAddressInvalid],
        error: 'Bad Request',
      });
  });

  it('/auth/sign-in (POST) should successfully sign-in when trying to sign in a user with the correct email address and password.', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    const signInPayload = {
      emailAddress,
      password,
    };

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(201)
      .then(() => {
        return request(app.getHttpServer())
          .post('/auth/sign-in')
          .send(signInPayload)
          .expect(201);
      });
  });

  it('/auth/sign-in (POST) should fail with appropriate message when trying to sign in a user with the incorrect email address.', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    const signInPayload = {
      emailAddress: faker.internet.email(),
      password,
    };

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(201)
      .then(() => {
        return request(app.getHttpServer())
          .post('/auth/sign-in')
          .send(signInPayload)
          .expect(401, {
            statusCode: 401,
            message: LOGIN_UNAUTHORIZED_MESSAGE,
            error: 'Unauthorized',
          });
      });
  });

  it('/auth/sign-in (POST) should fail with appropriate message when trying to sign in a user with the incorrect password.', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    const signInPayload = {
      emailAddress,
      password: faker.internet.password(),
    };

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(201)
      .then(() => {
        return request(app.getHttpServer())
          .post('/auth/sign-in')
          .send(signInPayload)
          .expect(401, {
            statusCode: 401,
            message: LOGIN_UNAUTHORIZED_MESSAGE,
            error: 'Unauthorized',
          });
      });
  });
});
