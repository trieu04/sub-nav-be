import { Module } from "@nestjs/common";
import { GlobalConfigModule } from "../configs/global-config.module";
import { AuthModule } from "../modules/auth/auth.module";
import { HealthModule } from "../modules/health/health.module";
import { UsersModule } from "../modules/users/users.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [GlobalConfigModule, AuthModule, UsersModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
