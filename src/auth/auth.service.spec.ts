import { OTPRepository } from './repositories/otp-repository';
import { EmailSenderService } from '../email-sender/email-sender.service';
import { JwtTokenDto } from './dto/JwtToken.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, JWT_EXPIRY_PERIOD } from './auth.service';
import { AccountRepository } from './repositories/account-repository';
import { CreateAccountDto } from './dto/create-account.dto';
import * as faker from 'faker';
import { JwtModule } from '@nestjs/jwt';
import { JWT_CONSTANTS } from './utils/const';
import { Account, AccountSchema } from './schemas/account-schema';
import {
  closeInMemoryMongoConnection,
  rootMongooseTestModule,
} from '../utils/mongo-inmemory-db-handler';
import { MongooseModule } from '@nestjs/mongoose';
import { Password, PasswordSchema } from './schemas/passwords-schema';
import { PasswordRepository } from './repositories/password-repository';
import {
  OTPVerification,
  OTPVerificationSchema,
} from './schemas/otp-verification-schema';
import { ACCOUNT_NOT_FOUND_ERROR_MESSAGE, OTP_VERIFICATION_OTP_INVALID } from './utils/messages';
import { ResetPasswordDTO } from './dto/reset-password.dto';

describe('AuthService', () => {
  let service: AuthService;
  let accountRepo: AccountRepository;
  let passwordRepo: PasswordRepository;
  let emailService: EmailSenderService;
  let otpRepo: OTPRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {
            name: Account.name,
            schema: AccountSchema,
          },
          {
            name: Password.name,
            schema: PasswordSchema,
          },
          {
            name: OTPVerification.name,
            schema: OTPVerificationSchema,
          },
        ]),
        JwtModule.register({
          secret: JWT_CONSTANTS.secret,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AuthService,
        AccountRepository,
        PasswordRepository,
        OTPRepository,
        {
          provide: EmailSenderService,
          useFactory: () => ({
            sendOTPVericationEmail: jest.fn(() => true),
          }),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    accountRepo = module.get<AccountRepository>(AccountRepository);
    passwordRepo = module.get<PasswordRepository>(PasswordRepository);
    emailService = module.get<EmailSenderService>(EmailSenderService);
    otpRepo = module.get<OTPRepository>(OTPRepository);
  });

  afterAll(async () => await closeInMemoryMongoConnection());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a new account when createAccount() is called with the correct values in the payload and send verification email to account email address.', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    await service.createAccount(createAccountParams);

    // Check if the account exists in the DB
    const account = await accountRepo.findByEmailAddress(emailAddress);
    expect(account).toBeDefined();
    expect(account.firstName).toEqual(createAccountParams.firstName);
    expect(account.lastName).toEqual(createAccountParams.lastName);
    expect(account.emailAddress).toEqual(createAccountParams.emailAddress);
    expect(account.verified).toEqual(false);

    // Check if password was created for account
    const passwordForAccount = await passwordRepo.find(account._id);
    expect(passwordForAccount).toBeDefined();

    // Check if email was sent
    expect(emailService.sendOTPVericationEmail).toHaveBeenCalledTimes(1);

    // Check if token was saved for account
    const otp = await otpRepo.find(account.id);
    expect(otp).toBeDefined();
  });

  it('should successfully validate an account when validateAccount() is called with the correct emailAddress and password and return the validated account', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    await service.createAccount(createAccountParams);

    const validatedAccount = await service.validateAccount(
      emailAddress,
      password,
    );

    // Check if validated account returned
    expect(validatedAccount).toBeDefined();
    expect(validatedAccount.firstName).toEqual(createAccountParams.firstName);
    expect(validatedAccount.lastName).toEqual(createAccountParams.lastName);
    expect(validatedAccount.emailAddress).toEqual(emailAddress);
  });

  it('should return a jwt token when sign in is called.', async () => {
    const token: JwtTokenDto = await service.signIn({
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email(),
      verified: true,
    });

    expect(token).toBeDefined();
    expect(token.access_token).toBeDefined();
    expect(token.expires).toBeDefined();
    expect(token.expires).toBe(JWT_EXPIRY_PERIOD);
  });

  it('should successfully verify an account when verifyAccount() is called with the correct values.', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    await service.createAccount(createAccountParams);

    // Check if the account exists in the DB
    const account = await accountRepo.findByEmailAddress(emailAddress);
    expect(account).toBeDefined();
    expect(account.firstName).toEqual(createAccountParams.firstName);
    expect(account.lastName).toEqual(createAccountParams.lastName);
    expect(account.emailAddress).toEqual(createAccountParams.emailAddress);
    expect(account.verified).toEqual(false);

    // Check if email was sent
    expect(emailService.sendOTPVericationEmail).toHaveBeenCalledTimes(1);

    // Check if token was saved for account
    const otp = await otpRepo.find(account.id);
    expect(otp).toBeDefined();

    await service.verifyAccount({
      emailAddress: account.emailAddress,
      otp: otp.otp,
    });

    // Check if account was verified
    const verifiedAccount = await accountRepo.findByEmailAddress(emailAddress);
    expect(verifiedAccount.verified).toBe(true);

    // Check if used otp has been deleted
    const deletedOTP = await otpRepo.find(account.id);
    expect(deletedOTP).toBe(null);
  });

  it('should fail to verify an account when verifyAccount() is called with an incorrect otp.', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    await service.createAccount(createAccountParams);

    // Check if the account exists in the DB
    const account = await accountRepo.findByEmailAddress(emailAddress);
    expect(account).toBeDefined();
    expect(account.firstName).toEqual(createAccountParams.firstName);
    expect(account.lastName).toEqual(createAccountParams.lastName);
    expect(account.emailAddress).toEqual(createAccountParams.emailAddress);
    expect(account.verified).toEqual(false);

    // Check if email was sent
    expect(emailService.sendOTPVericationEmail).toHaveBeenCalledTimes(1);

    // Check if token was saved for account
    const otp = await otpRepo.find(account.id);
    expect(otp).toBeDefined();

    try {
      await service.verifyAccount({
        emailAddress: account.emailAddress,
        otp: 123456,
      });
    } catch (error) {
      expect(error.message).toEqual(OTP_VERIFICATION_OTP_INVALID);
    }
  });

  it('should successfully send account verification email when sendVerification() is called with the correct values and replace old otp.', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    await service.createAccount(createAccountParams);

    // Check if the account exists in the DB
    const account = await accountRepo.findByEmailAddress(emailAddress);
    expect(account).toBeDefined();
    expect(account.firstName).toEqual(createAccountParams.firstName);
    expect(account.lastName).toEqual(createAccountParams.lastName);
    expect(account.emailAddress).toEqual(createAccountParams.emailAddress);
    expect(account.verified).toEqual(false);

    // Check if email was sent
    expect(emailService.sendOTPVericationEmail).toHaveBeenCalledTimes(1);

    // Check if token was saved for account
    const otp = await otpRepo.find(account.id);
    expect(otp).toBeDefined();

    await service.sendAccountVerification({
      emailAddress: account.emailAddress,
    });

    // Check if new otp has been created and is not the same as the old one
    const newOTP = await otpRepo.find(account.id);
    expect(newOTP).toBeDefined();
    expect(newOTP.otp).not.toEqual(otp.otp);
  });

  it('should successfully reset password when resetPassword() is called with the correct email address.', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    await service.createAccount(createAccountParams);

    // Check if the account exists in the DB
    const account = await accountRepo.findByEmailAddress(emailAddress);
    expect(account).toBeDefined();
    expect(account.firstName).toEqual(createAccountParams.firstName);
    expect(account.lastName).toEqual(createAccountParams.lastName);
    expect(account.emailAddress).toEqual(createAccountParams.emailAddress);
    expect(account.verified).toEqual(false);
    
    const oldPassword = await passwordRepo.find(account._id);
    expect(oldPassword).toBeDefined();

    const newPassword = faker.internet.password();

    const resetPasswordPayload: ResetPasswordDTO = {
      emailAddress,
      password: newPassword,
      confirmPassword: newPassword,
    }

    await service.resetPassword(resetPasswordPayload);

    const updatedPassword = await passwordRepo.find(account._id);
    expect(updatedPassword).toBeDefined();

    // Check if passwords aren't the same
    expect(oldPassword.passwordHash).not.toEqual(updatedPassword.passwordHash);
  });

  it('should fail to reset password when resetPassword() is called with an incorrect email address.', async () => {
    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };

    await service.createAccount(createAccountParams);

    // Check if the account exists in the DB
    const account = await accountRepo.findByEmailAddress(emailAddress);
    expect(account).toBeDefined();
    expect(account.firstName).toEqual(createAccountParams.firstName);
    expect(account.lastName).toEqual(createAccountParams.lastName);
    expect(account.emailAddress).toEqual(createAccountParams.emailAddress);
    expect(account.verified).toEqual(false);
    
    const oldPassword = await passwordRepo.find(account._id);
    expect(oldPassword).toBeDefined();

    const newPassword = faker.internet.password();

    const resetPasswordPayload: ResetPasswordDTO = {
      emailAddress: faker.internet.email(),
      password: newPassword,
      confirmPassword: newPassword,
    }
    
    try {
      await service.resetPassword(resetPasswordPayload);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toBe(ACCOUNT_NOT_FOUND_ERROR_MESSAGE);
    }
  });
});
