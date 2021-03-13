import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailSenderService } from './email-sender.service';
import { EmailPayload } from './models/email-payload';

describe('EmailSenderService', () => {
  let service: EmailSenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useFactory: ()=>({
            get: jest.fn(()=> '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')
          }),
        },
        EmailSenderService,
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
        recipient: 'Bongs',
        code: 12345,
      },
    };

    await service.sendOTPVericationEmail(payload);
  });
});
