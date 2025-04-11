import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { createConfigErrorProxy } from "../../common/proxies/create-config-error.proxy";

@Injectable()
export class GoogleOauthService {
  client: OAuth2Client;
  private readonly logger = new Logger(GoogleOauthService.name);

  constructor(configService: ConfigService) {
    const clientId = configService.get<string>("oauth.google.clientID");
    const clientSecret = configService.get<string>("oauth.google.clientSecret");
    if (clientId && clientSecret) {
      this.client = new OAuth2Client({
        clientId,
        clientSecret,
        redirectUri: "postmessage",
      });
    }

    else {
      this.logger.warn(
        "Google OAuth configuration (clientID or clientSecret) is missing. "
        + "GoogleAuthService will be unavailable and throw errors on use.",
      );
      return createConfigErrorProxy(this);
    }
  }
}
