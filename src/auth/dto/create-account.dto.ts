import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { IsSameAs } from '../utils/is-same-as-validation-decorator';

export class CreateAccountDto {
  @IsNotEmpty({ message: 'The firstName cannot be empty.' })
  firstName: string;

  @IsNotEmpty({ message: 'The lastName cannot be empty.' })
  lastName: string;

  @IsEmail()
  emailAddress: string;

  @MinLength(8, {
    message: 'The password needs to at least be 8 characters long.',
  })
  password: string;

  @MinLength(8, {
    message: 'The password needs to at least be 8 characters long.',
  })
  @IsSameAs('password', {
    message: 'Confirmation password must be the same as password.',
  })
  confirmPassword: string;
}
