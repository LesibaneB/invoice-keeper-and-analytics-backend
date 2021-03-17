import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Password, PasswordDocument } from '../schemas/passwords-schema';

@Injectable()
export class PasswordRepository {
  constructor(
    @InjectModel(Password.name) private passwordModel: Model<PasswordDocument>,
  ) {}

  public async save(accountId: string, passwordHash: string): Promise<void> {
    const password = new this.passwordModel({ accountId, passwordHash });
    await password.save();
  }

  public async find(accountId: string): Promise<Password> {
    return this.passwordModel.findOne({ accountId }).exec();
  }

  public async update(accountId: string, passwordHash): Promise<void> {
    await this.passwordModel.updateOne(
      { accountId },
      { $set: { passwordHash } },
    );
  }
}
