import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from '../schemas/account-schema';
import { Model } from 'mongoose';
import { CreateAccountDto } from '../dto/create-account.dto';
import { Password, PasswordDocument } from '../schemas/passwords-schema';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Password.name) private passwordModel: Model<PasswordDocument>,
  ) {}

  public async save(
    registerAccountData: CreateAccountDto,
  ): Promise<AccountDocument> {
    const account = new this.accountModel(registerAccountData);
    return account.save();
  }

  public async findByEmailAddress(
    emailAddress: string,
  ): Promise<AccountDocument> {
    return this.accountModel.findOne({ emailAddress }).exec();
  }

  public async savePassword(
    accountId: string,
    passwordHash: string,
  ): Promise<void> {
    const password = new this.passwordModel({ accountId, passwordHash });
    await password.save();
  }

  public async findPassword(accountId: string): Promise<Password> {
    return this.passwordModel.findOne({ accountId }).exec();
  }
}
