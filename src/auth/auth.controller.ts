import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtTokenDto } from './dto/JwtToken.dto';
import { VerifyAccountDTO as VerifyAccountDTO } from './dto/verify-otp.dto';
import { ResendAccountVerificationDTO } from './dto/resend-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/account')
  public async createAccount(@Body() payload: CreateAccountDto): Promise<void> {
    try {
      await this.authService.createAccount(payload);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  public async login(@Request() req): Promise<JwtTokenDto> {
    return this.authService.signIn(req.user);
  }

  @Post('/account/verify')
  public async verifyAccount(@Body() payload: VerifyAccountDTO): Promise<void> {
    try {
      await this.authService.verifyAccount(payload);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('/account/resend-verification')
  public async resendAccountVerification(@Body() payload: ResendAccountVerificationDTO): Promise<void> {
    try {
      await this.authService.resendAccountVerification(payload);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
