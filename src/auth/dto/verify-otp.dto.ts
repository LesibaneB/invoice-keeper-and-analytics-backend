import { IsEmail, IsNumber } from 'class-validator';
import { IsNumberLength } from '../utils/is-number-length-validation-decorator';
import {
  EMAIL_ADDRESS_INVALID,
  OTP_VERIFICATION_OTP_NOT_NUMERIC,
  OTP_VERIFICATION_OTP_TOO_SHORT,
} from '../utils/messages';

export class VerifyAccountDTO {
  @IsNumber({}, { message: OTP_VERIFICATION_OTP_NOT_NUMERIC })
  @IsNumberLength(6, { message: OTP_VERIFICATION_OTP_TOO_SHORT })
  readonly otp: number;

  @IsEmail({}, { message: EMAIL_ADDRESS_INVALID })
  readonly emailAddress: string;
}
