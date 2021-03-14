import { AccountRepository } from './repositories/account-repository';
import { OTPRepository } from './repositories/otp-repository';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { CreateAccountDto } from './dto/create-account.dto';
import * as faker from 'faker';
import {
  closeInMemoryMongoConnection,
  rootMongooseTestModule,
} from '../utils/mongo-inmemory-db-handler';
import { AuthModule } from './auth.module';
import { BadRequestException } from '@nestjs/common';
import {
  ACCOUNT_EXISTS_ERROR_MESSAGE,
  ACCOUNT_NOT_FOUND_ERROR_MESSAGE,
  OTP_VERIFICATION_OTP_INVALID,
} from './utils/messages';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account-schema';
import {
  OTPVerification,
  OTPVerificationSchema,
} from './schemas/otp-verification-schema';

describe('AuthController', () => {
  let controller: AuthController;
  let otpRepo: OTPRepository;
  let accountRepo: AccountRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        AuthModule,
        MongooseModule.forFeature([
          {
            name: Account.name,
            schema: AccountSchema,
          },
          {
            name: OTPVerification.name,
            schema: OTPVerificationSchema,
          },
        ]),
      ],
      providers: [AccountRepository, OTPRepository],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    otpRepo = module.get<OTPRepository>(OTPRepository);
    accountRepo = module.get<AccountRepository>(AccountRepository);
  });

  afterEach(async () => await closeInMemoryMongoConnection());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should successfully call the auth controller to create account', async () => {
    const password = faker.internet.password();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email(),
      password,
      confirmPassword: password,
    };

    await controller.createAccount(createAccountParams);
  });

  it('should fail with appropriate message when the auth controller is called to create a duplicate email account', async () => {
    const password = faker.internet.password();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email(),
      password,
      confirmPassword: password,
    };

    await controller.createAccount(createAccountParams);
    try {
      await controller.createAccount(createAccountParams);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe(ACCOUNT_EXISTS_ERROR_MESSAGE);
    }
  });

  it('should successfully verify an account when verifyAccount() is called with the correct values.', async () => {
    const password = faker.internet.password();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email(),
      password,
      confirmPassword: password,
    };

    await controller.createAccount(createAccountParams);

    // Find created account
    const account = await accountRepo.findByEmailAddress(
      createAccountParams.emailAddress,
    );
    expect(account).toBeDefined();

    // Find OTP for account
    const otp = await otpRepo.find(account._id);
    expect(otp).toBeDefined();

    await controller.verifyAccount({
      emailAddress: account.emailAddress,
      otp: otp.otp,
    });
  });

  it('should fail to verify an account when verifyAccount() is called with an incorrect otp.', async () => {
    const password = faker.internet.password();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email(),
      password,
      confirmPassword: password,
    };

    await controller.createAccount(createAccountParams);

    try {
      await controller.verifyAccount({
        emailAddress: createAccountParams.emailAddress,
        otp: 123456,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(OTP_VERIFICATION_OTP_INVALID);
    }
  });

  it('should successfully resend account verification when resendVerification() is called with the correct values.', async () => {
    const password = faker.internet.password();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email(),
      password,
      confirmPassword: password,
    };

    await controller.createAccount(createAccountParams);

    // Find created account
    const account = await accountRepo.findByEmailAddress(
      createAccountParams.emailAddress,
    );

    expect(account).toBeDefined();

    // Find old OTP for account
    const otp = await otpRepo.find(account._id);

    await controller.resendAccountVerification({
      emailAddress: account.emailAddress,
    });

    // Find new OTP for account
    const newOtp = await otpRepo.find(account._id);

    // Check that new OTP is not equal to the old
    expect(newOtp.otp).not.toBe(otp.otp);
  });

  it('should fail to resend account verification when resendAccountVerification() is called with an incorrect email address.', async () => {
    const password = faker.internet.password();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email(),
      password,
      confirmPassword: password,
    };

    await controller.createAccount(createAccountParams);

    try {
      await controller.resendAccountVerification({
        emailAddress: faker.internet.email(),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(ACCOUNT_NOT_FOUND_ERROR_MESSAGE);
    }
  });
});
