import { Injectable, Logger } from '@nestjs/common';
import { AccountRepository } from './repositories/account-repository';
import { CreateAccountDto } from './dto/create-account.dto';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private accountRepo: AccountRepository) {}

  public async createAccount(
    registerAccountData: CreateAccountDto,
  ): Promise<void> {
    const { emailAddress, password } = registerAccountData;
    const accountWithIdenticalEmail = await this.accountRepo.findByEmailAddress(
      emailAddress,
    );

    if (accountWithIdenticalEmail) {
      this.logger.error(
        `Account with email address ${emailAddress} already exists`,
      );
      throw new Error('An account with this email address already exists');
    }

    const newAccount = await this.accountRepo.save(registerAccountData);
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await this.accountRepo.savePassword(newAccount._id, passwordHash);
  }
}
