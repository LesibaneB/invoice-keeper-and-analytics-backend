import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtTokenDto } from './dto/JwtToken.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Get('/test-jwt')
  getProfile(@Request() req) {
    return req.user;
  }
}
