import { Injectable } from '@nestjs/common';
import { AccountRepository } from './repositories/account-repository';
import { RegisterAccountDto } from './dto/register-account.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private accountRepo: AccountRepository) {}

  public async createAccount(
    registerAccountData: RegisterAccountDto,
  ): Promise<void> {
    const { emailAddress, password } = registerAccountData;
    const accountWithIdenticalEmail = await this.accountRepo.findByEmailAddress(
      emailAddress,
    );

    if (accountWithIdenticalEmail) {
      throw new Error('An account with this email address already exists');
    }

    const newAccount = await this.accountRepo.save(registerAccountData);
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await this.accountRepo.savePassword(newAccount._id, passwordHash);
  }
}
