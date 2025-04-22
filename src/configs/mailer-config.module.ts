import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';

const logger = new Logger('MailerConfigModule');

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const host = configService.get("mailer.host");
        const port = configService.get("mailer.port");
        const secure = configService.get("mailer.secure", false);
        const user = configService.get("mailer.user");
        const pass = configService.get("mailer.pass");
        const from = configService.get("mailer.from");

        if (!host || !port || !user || !pass) {
          logger.warn("Mailer configuration is not complete. Email sending will not work.");
        }

        return {
          transport: {
            host,
            port,
            secure,
            auth: {
              user,
              pass,
            },
          },
          defaults: {
            from,
          },
          template: {
            dir: join(globalThis.appRoot, "modules", "mail", "templates"),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class MailerConfigModule {}
