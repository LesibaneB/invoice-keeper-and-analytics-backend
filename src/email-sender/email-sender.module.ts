import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailSenderService } from './email-sender.service';
import sendGridMail from '@sendgrid/mail';

@Module({
  imports: [ConfigModule],
  providers: [
    EmailSenderService,
    {
      provide: 'SendGridMail',
      useFactory: async (configService: ConfigService) =>
        sendGridMail.setApiKey(configService.get<string>('api.sendEmailKey')),
      inject: [ConfigService],
    },
  ],
})
export class EmailSenderModule {}
