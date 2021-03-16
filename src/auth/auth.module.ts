import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account-schema';
import { AccountRepository } from './repositories/account-repository';
import { Password, PasswordSchema } from './schemas/passwords-schema';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JWT_CONSTANTS } from './utils/const';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  OTPVerification,
  OTPVerificationSchema,
} from './schemas/otp-verification-schema';
import { PasswordRepository } from './repositories/password-repository';
import { OTPRepository } from './repositories/otp-repository';
import { EmailSenderService } from '../email-sender/email-sender.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Account.name,
        schema: AccountSchema,
      },
      {
        name: Password.name,
        schema: PasswordSchema,
      },
      {
        name: OTPVerification.name,
        schema: OTPVerificationSchema,
      },
    ]),
    PassportModule,
    JwtModule.register({
      secret: JWT_CONSTANTS.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    AuthService,
    AccountRepository,
    LocalStrategy,
    JwtStrategy,
    PasswordRepository,
    OTPRepository,
    EmailSenderService,
    ConfigService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
