import { Inject, Injectable, Logger } from '@nestjs/common';
import { EmailPayload } from './models/email-payload';
import sendGridMail, { MailDataRequired, MailService } from '@sendgrid/mail';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Mustache from 'mustache';

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);

  constructor(@Inject('SendGridMail') readonly sendGridMail: MailService) {}

  public async sendOTPVericationEmail(
    emailPayload: EmailPayload,
  ): Promise<void> {
    const { to, subject, templateName, payload } = emailPayload;

    const template = await this.loadTemplate(templateName);

    const renderdTemplate = Mustache.render(template, payload);

    const msg: MailDataRequired = {
      to,
      from: 'bonakele.lesibane@gmail.com',
      subject,
      html: renderdTemplate,
    };

    try {
      await sendGridMail.send(msg);
      this.logger.log(`Sent mail to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to address ${to} with error ${error.message} and status ${error.status}.`,
      );
    }
  }

  private async loadTemplate(templateName: string): Promise<string> {
    let template: string;
    try {
      template = readFileSync(
        join(`${process.cwd()}/src/views/templates`, templateName),
        'utf8',
      );
    } catch (error) {
      this.logger.error(
        `Load email template failed with error ${error.message}.`,
      );
    }
    return template;
  }
}
