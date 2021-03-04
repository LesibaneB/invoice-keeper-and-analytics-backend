import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailSenderService } from './email-sender.service';
import { EmailPayload } from './models/email-payload';

describe('EmailSenderService', () => {
  let service: EmailSenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        EmailSenderService,
        {
          provide: 'SendGridMail',
          useFactory: () => ({
            send: jest.fn(() => true),
          }),
        },
      ],
    }).compile();

    service = module.get<EmailSenderService>(EmailSenderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('successfully send email when provided the correct template.', async () => {
    const payload: EmailPayload = {
      to: 'bonakele@gmail.com',
      subject: 'OTP verification',
      templateName: 'otp-email.html',
      payload: {
        receipient: 'Bongs',
        code: 12345,
      },
    };

    await service.sendOTPVericationEmail(payload);
  });
});
