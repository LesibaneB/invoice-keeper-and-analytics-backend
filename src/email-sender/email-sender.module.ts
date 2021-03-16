import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailSenderService } from './email-sender.service';

@Module({
  imports: [ConfigModule],
  providers: [
    EmailSenderService,
  ],
})
export class EmailSenderModule {}
