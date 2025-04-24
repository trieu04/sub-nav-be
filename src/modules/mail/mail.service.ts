import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import type { SentMessageInfo } from "nodemailer/lib/sendmail-transport";

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
  ) { }

  async sendTestEmail(email: string) {
    const result = await this.mailerService.sendMail({
      to: email,
      subject: "Test Email",
      template: "test.hbs",
    }) as SentMessageInfo;

    return result;
  }
}
