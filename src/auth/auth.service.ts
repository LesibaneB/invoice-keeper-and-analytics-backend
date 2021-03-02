import { Injectable, Logger } from '@nestjs/common';
import { AccountRepository } from './repositories/account-repository';
import { CreateAccountDto } from './dto/create-account.dto';
import * as bcrypt from 'bcrypt';
import { Account } from './schemas/account-schema';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenDto } from './dto/JwtToken.dto';
import { ACCOUNT_EXISTS_ERROR_MESSAGE } from './utils/messages';

const SALT_ROUNDS = 10;
export const JWT_EXPIRY_PERIOD = 3600;
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly jwtService: JwtService,
  ) {}

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
      throw new Error(ACCOUNT_EXISTS_ERROR_MESSAGE);
    }

    const newAccount = await this.accountRepo.save(registerAccountData);
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await this.accountRepo.savePassword(newAccount._id, passwordHash);
  }

  public async validateAccount(
    emailAddress: string,
    password: string,
  ): Promise<Account> {
    const account = await this.accountRepo.findByEmailAddress(emailAddress);
    if (!account) {
      this.logger.error(`Account for email ${emailAddress} not found.`);
      return null;
    }

    if (await this.passwordMatches(account._id, password)) {
      this.logger.log(
        `Password matches for account ${account._id}, continue....`,
      );
      return account;
    }

    return null;
  }

  public signIn(account: Account): JwtTokenDto {
    return {
      access_token: this.jwtService.sign({
        firstName: account.firstName,
        lastName: account.lastName,
        emailAddress: account.emailAddress,
      }),
      expires: JWT_EXPIRY_PERIOD,
    };
  }

  private async passwordMatches(
    accountId: string,
    password: string,
  ): Promise<boolean> {
    const savedPassword = await this.accountRepo.findPassword(accountId);
    if (!savedPassword) {
      this.logger.error(`Password for account ${accountId} not found.`);
      return false;
    }

    return bcrypt.compare(password, savedPassword.passwordHash);
  }
}
