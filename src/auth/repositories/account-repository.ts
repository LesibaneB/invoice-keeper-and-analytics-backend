import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from '../schemas/account-schema';
import { Model } from 'mongoose';
import { CreateAccountDto } from '../dto/create-account.dto';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
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

  public async updateVerified(accountId: string): Promise<void> {
    await this.accountModel
      .updateOne({ _id: accountId }, { $set: { verified: true } })
      .exec();
  }
}
