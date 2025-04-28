import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MailModule } from "../mail/mail.module";
import { AccountEntity } from "../../entities/account.entity";
import { PasswordEntity } from "../../entities/password.entity";
import { TokenEntity } from "../../entities/token.entity";
import { UserEntity } from "../../entities/user.entity";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { GoogleOauthModule } from "./google-oauth/google-oauth.module";

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([UserEntity, AccountEntity, PasswordEntity, TokenEntity]),
    MailModule,
    GoogleOauthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService],
})
export class AuthModule { }
