import { Body, Controller, Post } from '@nestjs/common';
import { RegisterAccountDto } from './dto/register-account.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  public async registerAccount(
    @Body() payload: RegisterAccountDto,
  ): Promise<void> {
    await this.authService.createAccount(payload);
  }
}
