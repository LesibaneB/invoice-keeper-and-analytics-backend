import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/account')
  public async createAccount(@Body() payload: CreateAccountDto): Promise<any> {
    try {
      await this.authService.createAccount(payload);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
