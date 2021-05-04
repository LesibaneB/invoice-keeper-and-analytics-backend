import { OTPRepository } from './repositories/otp-repository';
import { Injectable, Logger } from '@nestjs/common';
import { AccountRepository } from './repositories/account-repository';
import { CreateAccountDto } from './dto/create-account.dto';
import * as bcrypt from 'bcrypt';
import { Account, AccountDocument } from './schemas/account-schema';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenDto } from './dto/jwt-token.dto';
import {
  ACCOUNT_EXISTS_ERROR_MESSAGE,
  ACCOUNT_NOT_FOUND_ERROR_MESSAGE,
  OTP_VERIFICATION_OTP_EXPIRED,
  OTP_VERIFICATION_OTP_INVALID,
} from './utils/messages';
import { PasswordRepository } from './repositories/password-repository';
import {
  checkOTPExpired,
  generateOTP,
  generateOTPExpiry,
  otpMatches,
} from './utils/otp';
import { EmailSenderService } from '../email-sender/email-sender.service';
import { EmailPayload } from '../email-sender/models/email-payload';
import { VerifyAccountDTO } from './dto/verify-otp.dto';
import { SendAccountVerificationDTO } from './dto/resend-otp.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';

const SALT_ROUNDS = 10;
export const JWT_EXPIRY_PERIOD = 3600;
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly jwtService: JwtService,
    private readonly passwordRepo: PasswordRepository,
    private readonly otpRepository: OTPRepository,
    private readonly emailService: EmailSenderService,
  ) {}

  public async createAccount(
    registerAccountData: CreateAccountDto,
  ): Promise<void> {
    const { emailAddress, password, firstName } = registerAccountData;
    const accountWithIdenticalEmail = await this.accountRepository.findByEmailAddress(
      emailAddress,
    );

    if (accountWithIdenticalEmail) {
      this.logger.error(
        `Account with email address ${emailAddress} already exists`,
      );
      throw new Error(ACCOUNT_EXISTS_ERROR_MESSAGE);
    }

    const newAccount = await this.accountRepository.save(registerAccountData);
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await this.passwordRepo.save(newAccount._id, passwordHash);

    const otpCode = generateOTP();

    const otp = {
      accountId: newAccount._id,
      otp: otpCode,
      expiry: generateOTPExpiry(),
    };

    await this.otpRepository.save(otp);

    const emailPayload: EmailPayload = {
      to: emailAddress,
      subject: 'OTP verification',
      templateName: 'otp-email.html',
      payload: {
        recipient: firstName,
        code: otpCode,
      },
    };

    await this.emailService.sendOTPVericationEmail(emailPayload);
  }

  public async validateAccount(
    emailAddress: string,
    password: string,
  ): Promise<AccountDocument> {
    const account = await this.accountRepository.findByEmailAddress(
      emailAddress,
    );
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

  public signIn(account: AccountDocument): JwtTokenDto {
    return {
      access_token: this.jwtService.sign({
        accountId: account._id,
        firstName: account.firstName,
        lastName: account.lastName,
        emailAddress: account.emailAddress,
        verified: account.verified,
      }),
      expires: JWT_EXPIRY_PERIOD,
    };
  }

  public async verifyAccount(payload: VerifyAccountDTO): Promise<void> {
    const { emailAddress, otp } = payload;
    const account = await this.accountRepository.findByEmailAddress(
      emailAddress,
    );
    if (!account) {
      this.logger.error(`Account for email ${emailAddress} not found.`);
      throw new Error(ACCOUNT_NOT_FOUND_ERROR_MESSAGE);
    }

    const otpVerification = await this.otpRepository.find(account._id);

    if (!otpVerification) {
      this.logger.error(`OTP for user ${account._id} not found.`);
      throw new Error(OTP_VERIFICATION_OTP_INVALID);
    }

    if (checkOTPExpired(otpVerification.expiry)) {
      this.logger.error(`OTP for user ${account._id} has expired.`);
      throw new Error(OTP_VERIFICATION_OTP_EXPIRED);
    }

    if (!otpMatches(otp, otpVerification.otp)) {
      this.logger.error(`OTP for user ${account._id} does not match.`);
      throw new Error(OTP_VERIFICATION_OTP_INVALID);
    }

    await this.accountRepository.updateVerified(account.id);

    await this.otpRepository.delete(account._id);
  }

  public async sendAccountVerification(
    payload: SendAccountVerificationDTO,
  ): Promise<void> {
    const { emailAddress } = payload;
    const account = await this.accountRepository.findByEmailAddress(
      emailAddress,
    );
    if (!account) {
      this.logger.error(`Account for email ${emailAddress} not found.`);
      throw new Error(ACCOUNT_NOT_FOUND_ERROR_MESSAGE);
    }

    const otpCode = generateOTP();

    const otp = {
      accountId: account._id,
      otp: otpCode,
      expiry: generateOTPExpiry(),
    };

    await this.otpRepository.delete(account._id);

    await this.otpRepository.save(otp);

    const emailPayload: EmailPayload = {
      to: emailAddress,
      subject: 'OTP verification',
      templateName: 'otp-email.html',
      payload: {
        recipient: account.firstName,
        code: otpCode,
      },
    };

    await this.emailService.sendOTPVericationEmail(emailPayload);
  }

  public async resetPassword(payload: ResetPasswordDTO): Promise<void> {
    const { emailAddress, password } = payload;
    const account = await this.accountRepository.findByEmailAddress(
      emailAddress,
    );
    if (!account) {
      this.logger.error(`Account for email ${emailAddress} not found.`);
      throw new Error(ACCOUNT_NOT_FOUND_ERROR_MESSAGE);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await this.passwordRepo.update(account._id, passwordHash);
  }

  private async passwordMatches(
    accountId: string,
    password: string,
  ): Promise<boolean> {
    const savedPassword = await this.passwordRepo.find(accountId);
    if (!savedPassword) {
      this.logger.error(`Password for account ${accountId} not found.`);
      return false;
    }

    return bcrypt.compare(password, savedPassword.passwordHash);
  }
}
