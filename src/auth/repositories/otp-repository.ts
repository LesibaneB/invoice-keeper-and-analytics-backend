import { OTPVerificationDocument } from './../schemas/otp-verification-schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { OTPVerification } from '../schemas/otp-verification-schema';
import { Model } from 'mongoose';

@Injectable()
export class OTPRepository {
  constructor(
    @InjectModel(OTPVerification.name)
    private otpModel: Model<OTPVerificationDocument>,
  ) {}

  public async save(otp: OTPVerification): Promise<void> {
    const newOTP = new this.otpModel(otp);
    await newOTP.save();
  }

  public async find(accountId: string): Promise<OTPVerification> {
    return await this.otpModel.findOne({
      accountId,
    });
  }

  public async delete(accountId: string): Promise<void> {
    await this.otpModel.findOneAndDelete({ accountId }).exec();
  }
}
