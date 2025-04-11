import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "node:path";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { configurations } from "./config-loader";

const logger = new Logger("GlobalConfigModule");

@Module({
  imports: [

    ConfigModule.forRoot({
      load: configurations,
      isGlobal: true,
    }),

    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get("jwt.secret");
        if (!secret) {
          logger.warn("JWT secret is not defined. JWT authentication will not work.");
        }
        return {
          secret,
        };
      },
      global: true,
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("db.host"),
        port: configService.get("db.port"),
        username: configService.get("db.username"),
        password: configService.get("db.password"),
        database: configService.get("db.database"),
        synchronize: configService.get("db.synchronize"),
        logging: configService.get("db.logging"),
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),

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
export class GlobalConfigModule { }
