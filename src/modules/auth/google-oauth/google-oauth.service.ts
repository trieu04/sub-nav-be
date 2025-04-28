import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { createConfigErrorProxy } from "../../../common/proxies/create-config-error.proxy";

@Injectable()
export class GoogleOAuthService {
  client: OAuth2Client;
  private extendedClients = new Map<string, OAuth2Client>();
  private clientId: string;
  private clientSecret: string;
  private readonly redirectUri = "postmessage";
  private readonly scope = "openid email";
  private readonly logger = new Logger(GoogleOAuthService.name);

  constructor(configService: ConfigService) {
    const clientId = configService.get<string>("google-oauth.clientID");
    const clientSecret = configService.get<string>("google-oauth.clientSecret");

    if (clientId && clientSecret) {
      this.client = new OAuth2Client({
        clientId,
        clientSecret,
        redirectUri: "postmessage",
      });
      this.clientId = clientId;
      this.clientSecret = clientSecret;
    }
    else {
      this.logger.warn(
        "Google OAuth configuration (clientID or clientSecret) is missing. "
        + "GoogleAuthService will be unavailable and throw errors on use.",
      );
      return createConfigErrorProxy(this);
    }
  }

  async getToken(code: string, clientName?: string) {
    if (clientName) {
      const client = this.getClient(clientName);
      return client.getToken(code);
    }
    return this.client.getToken(code);
  }

  createClient(name: string, options: { clientId?: string; clientSecret?: string; redirectUri: string }) {
    if (this.extendedClients.has(name)) {
      return this.extendedClients.get(name);
    }

    const {
      clientId = this.clientId,
      clientSecret = this.clientSecret,
      redirectUri,
    } = options;
    const client = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri,
    });
    this.extendedClients.set(name, client);

    return client;
  }

  getClient(name: string) {
    const client = this.extendedClients.get(name);
    if (!client) {
      throw new Error(`Client with name ${name} does not exist.`);
    }
    return client;
  }

  clearClient(name: string) {
    this.extendedClients.delete(name);
  }

  generateGoogleOAuthUrl({ redirectUri }: { redirectUri: string }) {
    return this.client.generateAuthUrl({
      access_type: "offline",
      redirect_uri: redirectUri,
      client_id: this.clientId,
      response_type: "code",
      scope: "openid email",
      prompt: "consent",
    });
  }
}
