import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'emailAddress' });
  }

  async validate(emailAddress: string, password: string): Promise<any> {
    const account = await this.authService.validateAccount(
      emailAddress,
      password,
    );
    if (!account) {
      throw new UnauthorizedException('Email address or password invalid.');
    }
    return account;
  }
}
