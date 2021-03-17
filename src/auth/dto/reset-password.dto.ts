import { IsEmail, MinLength } from 'class-validator';
import { IsSameAs } from '../utils/is-same-as-validation-decorator';
import { AUTH_ACCOUNT_ERROR_MESSAGES, EMAIL_ADDRESS_INVALID } from '../utils/messages';

export class ResetPasswordDTO {
  @IsEmail({}, { message: EMAIL_ADDRESS_INVALID })
  readonly emailAddress: string;

  @MinLength(8, {
    message: AUTH_ACCOUNT_ERROR_MESSAGES.passwordShort,
  })
  readonly password: string;

  @MinLength(8, {
    message: AUTH_ACCOUNT_ERROR_MESSAGES.passwordShort,
  })
  @IsSameAs('password', {
    message: AUTH_ACCOUNT_ERROR_MESSAGES.confirmPasswordNotMatch,
  })
  readonly confirmPassword: string;
}
