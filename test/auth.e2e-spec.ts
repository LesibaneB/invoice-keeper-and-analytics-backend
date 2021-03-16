import { VerifyAccountDTO } from './../src/auth/dto/verify-otp.dto';
import { OTPRepository } from './../src/auth/repositories/otp-repository';
import { EMAIL_ADDRESS_INVALID } from './../src/auth/utils/messages';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
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
import { AccountRepository } from '../src/auth/repositories/account-repository';
import { AuthModule } from '../src/auth/auth.module';
import { ResendAccountVerificationDTO } from 'src/auth/dto/resend-otp.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accountRepo: AccountRepository;
  let otpRepo: OTPRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), AuthModule],
    })
      .overrideProvider('EmailSenderService')
      .useFactory({
        factory: () => ({
          sendOTPVericationEmail: jest.fn(() => true),
        }),
      })
      .compile();

    accountRepo = moduleFixture.get<AccountRepository>(AccountRepository);
    otpRepo = moduleFixture.get<OTPRepository>(OTPRepository);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => await closeInMemoryMongoConnection());

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
        message: [EMAIL_ADDRESS_INVALID],
        error: 'Bad Request',
      });
  });

  it('/auth/sign-in (POST) should successfully sign-in when trying to sign in a user that has been verified using the correct email address and password.', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(201)
      .then(async () => {
        const account = await accountRepo.findByEmailAddress(emailAddress);
        expect(account).toBeDefined();

        const otp = await otpRepo.find(account._id);
        expect(otp).toBeDefined();

        const accountVerificationPayload: VerifyAccountDTO = {
          emailAddress,
          otp: otp.otp,
        };

        return request(app.getHttpServer())
          .post('/auth/account/verify')
          .send(accountVerificationPayload)
          .expect(201)
          .then(() => {
            const signInPayload = {
              emailAddress,
              password,
            };

            return request(app.getHttpServer())
              .post('/auth/sign-in')
              .send(signInPayload)
              .expect(201);
          });
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

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(201)
      .then(() => {
        const signInPayload = {
          emailAddress: faker.internet.email(),
          password,
        };

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

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(201)
      .then(() => {
        const signInPayload = {
          emailAddress,
          password: faker.internet.password(),
        };

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

  it('/auth/account/resend-verification (POST) should succesfully resend verification for an account when trying to resend verification with a correct email address.', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(201)
      .then(async () => {
        const resendVerificationPayload: ResendAccountVerificationDTO = {
          emailAddress,
        };
        return request(app.getHttpServer())
          .post('/auth/account/resend-verification')
          .send(resendVerificationPayload)
          .expect(201);
      });
  });
});
