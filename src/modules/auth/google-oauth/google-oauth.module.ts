import { Module } from "@nestjs/common";
import { GoogleOAuthService } from "./google-oauth.service";

@Module({
  imports: [],
  controllers: [],
  providers: [GoogleOAuthService],
  exports: [GoogleOAuthService],
})
export class GoogleOauthModule { }
