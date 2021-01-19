import { Body, Controller, Post } from '@nestjs/common';
import { RegisterAccountDto } from './dto/register-account.dto';

@Controller('auth')
export class AuthController {
  @Post('/register')
  public async registerAccount(
    @Body() payload: RegisterAccountDto,
  ): Promise<void> {
    console.log('payload : ', payload)
  }
}
