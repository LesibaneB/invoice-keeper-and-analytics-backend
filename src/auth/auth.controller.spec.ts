import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAccountDto } from './dto/create-account.dto';
import * as faker from 'faker';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceSpy: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: () => ({
            createAccount: jest.fn(() => false),
          }),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authServiceSpy = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call the auth service to create account', async () => {
    const password = faker.internet.password();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email(),
      password,
      confirmPassword: password,
    };

    await controller.createAccount(createAccountParams);
    expect(authServiceSpy.createAccount).toHaveBeenCalledWith(
      createAccountParams,
    );
    expect(authServiceSpy.createAccount).toHaveBeenCalledTimes(1);
  });
});
