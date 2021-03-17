import { ResetPasswordDTO } from './dto/reset-password.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtTokenDto } from './dto/JwtToken.dto';
import { VerifyAccountDTO as VerifyAccountDTO } from './dto/verify-otp.dto';
import { SendAccountVerificationDTO } from './dto/resend-otp.dto';

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

  @Post('/account/send-verification')
  public async sendAccountVerification(@Body() payload: SendAccountVerificationDTO): Promise<void> {
    try {
      await this.authService.sendAccountVerification(payload);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put('/account/reset-password')
  public async resetPassword(@Body() payload: ResetPasswordDTO): Promise<void> {
    try {
      await this.authService.resetPassword(payload);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
