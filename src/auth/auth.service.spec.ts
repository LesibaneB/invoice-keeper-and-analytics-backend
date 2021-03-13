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
import { OTPVerification, OTPVerificationSchema } from './schemas/otp-verification-schema';

describe('AuthService', () => {
  let service: AuthService;
  let accountRepo: AccountRepository;
  let passwordRepo: PasswordRepository;
  let emailService: EmailSenderService;

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
            schema: OTPVerificationSchema
          }
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
        useFactory: ()=>({
          sendOTPVericationEmail: jest.fn(()=>true),
        })
      }],
    }).compile();

    service = module.get<AuthService>(AuthService);
    accountRepo = module.get<AccountRepository>(AccountRepository);
    passwordRepo = module.get<PasswordRepository>(PasswordRepository);
    emailService = module.get<EmailSenderService>(EmailSenderService);
  });

  afterAll(async () => await closeInMemoryMongoConnection());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a new account when createAccount() is called with the correct values in the payload and send email to account email address.', async () => {
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

    // Check if password was created for account
    const passwordForAccount = await passwordRepo.findPassword(account._id);
    expect(passwordForAccount).toBeDefined();

    // Check if email was sent
    expect(emailService.sendOTPVericationEmail).toHaveBeenCalledTimes(1);
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
});
