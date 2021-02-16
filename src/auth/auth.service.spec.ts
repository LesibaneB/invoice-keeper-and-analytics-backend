import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AccountRepository } from './repositories/account-repository';
import { CreateAccountDto } from './dto/create-account.dto';
import * as faker from 'faker';

describe('AuthService', () => {
  let service: AuthService;
  let accountRepoSpy: AccountRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AccountRepository,
          useFactory: () => ({
            findByEmailAddress: jest.fn(() => false),
            save: jest.fn(() => false),
            savePassword: jest.fn(() => false),
          }),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    accountRepoSpy = module.get<AccountRepository>(AccountRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a new account when createAccount is called', async () => {
    const password = faker.internet.password();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email(),
      password,
      confirmPassword: password,
    };

    await service.createAccount(createAccountParams);

    // Check if the email address was checked for existence
    expect(accountRepoSpy.findByEmailAddress).toHaveBeenCalledWith(
      createAccountParams.emailAddress,
    );
    expect(accountRepoSpy.findByEmailAddress).toHaveBeenCalledTimes(1);

    // Check if the new account was saved
    expect(accountRepoSpy.save).toHaveBeenCalledWith(createAccountParams);
    expect(accountRepoSpy.save).toHaveBeenCalledTimes(1);

    // Check if a password was saved for the new account
    expect(accountRepoSpy.savePassword).toHaveBeenCalledTimes(1);
  });
});
