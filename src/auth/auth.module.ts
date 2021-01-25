import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account-schema';
import { AccountRepository } from './repositories/account-repository';
import { Password, PasswordSchema } from './schemas/passwords-schema';

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
  ],
  providers: [AuthService, AccountRepository],
  controllers: [AuthController]
})
export class AuthModule {}
