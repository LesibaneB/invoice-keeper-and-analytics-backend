import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { CreateAccountDto } from './dto/create-account.dto';
import * as faker from 'faker';
import { rootMongooseTestModule } from '../utils/mongo-inmemory-db-handler';
import { AuthModule } from './auth.module';
import { BadRequestException } from '@nestjs/common';
import { ACCOUNT_EXISTS_ERROR_MESSAGE } from './utils/messages';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), AuthModule],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

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
});
