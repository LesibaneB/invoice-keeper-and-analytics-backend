import { EMAIL_ADDRESS_INVALID } from './../utils/messages';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { IsSameAs } from '../utils/is-same-as-validation-decorator';
import { AUTH_CREATE_ACCOUNT_ERROR_MESSAGES } from '../utils/messages';

export class CreateAccountDto {
  @IsNotEmpty({ message: AUTH_CREATE_ACCOUNT_ERROR_MESSAGES.firstNameEmpty })
  readonly firstName: string;

  @IsNotEmpty({ message: AUTH_CREATE_ACCOUNT_ERROR_MESSAGES.lastNameEmpty })
  readonly lastName: string;

  @IsEmail(
    {},
    { message: EMAIL_ADDRESS_INVALID },
  )
  readonly emailAddress: string;

  @MinLength(8, {
    message: AUTH_CREATE_ACCOUNT_ERROR_MESSAGES.passwordShort,
  })
  readonly password: string;

  @MinLength(8, {
    message: AUTH_CREATE_ACCOUNT_ERROR_MESSAGES.passwordShort,
  })
  @IsSameAs('password', {
    message: AUTH_CREATE_ACCOUNT_ERROR_MESSAGES.confirmPasswordNotMatch,
  })
  readonly confirmPassword: string;
}
