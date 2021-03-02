import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account-schema';
import { AccountRepository } from './repositories/account-repository';
import { Password, PasswordSchema } from './schemas/passwords-schema';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JWT_CONSTANTS } from './utils/const';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Account.name,
        schema: AccountSchema,
      },
      {
        name: Password.name,
        schema: PasswordSchema,
      },
    ]),
    PassportModule,
    JwtModule.register({
      secret: JWT_CONSTANTS.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, AccountRepository, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
