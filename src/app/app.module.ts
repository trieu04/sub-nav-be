import { Module } from "@nestjs/common";
import { JwtConfigModule } from "../configs/jwt-config.module";
import { LoadConfigModule } from "../configs/load-config.module";
import { MailerConfigModule } from "../configs/mailer-config.module";
import { TypeOrmConfigModule } from "../configs/type-orm-config.module";
import { AuthModule } from "../modules/auth/auth.module";
import { HealthModule } from "../modules/health/health.module";
import { UsersModule } from "../modules/users/users.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    LoadConfigModule,
    TypeOrmConfigModule,
    JwtConfigModule,
    MailerConfigModule,

    AuthModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
