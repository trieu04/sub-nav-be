import { MailerService } from "@nestjs-modules/mailer";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { compareSync, hashSync } from "bcrypt";
import { nanoid } from "nanoid";
import { Repository } from "typeorm";

import { SALT_ROUND } from "../../common/constrains/crypto";
import { TOKEN_EXPIRATION } from "../../common/constrains/token";
import { AccountEntity, AccountProviderEnum } from "../../entities/account.entity";
import { PasswordEntity } from "../../entities/password.entity";
import { TokenTypeEnum, TokenEntity } from "../../entities/token.entity";
import { UserEntity } from "../../entities/user.entity";
import { GoogleOAuthService } from "./google-oauth/google-oauth.service";
import { ChangePasswordDto, RequestPasswordResetDto, ResetPasswordWithCodeDto } from "./dtos/password.dto";
import { GoogleOAuthDto } from "./dtos/google-oauth.dto";
import { SignInDto, SignUpDto } from "./dtos/auth.dto";
import { JwtPayloadTypes, JwtPayloadUserDto } from "./dtos/jwt-payload.dto";
import { ChangeUsernameDto } from "./dtos/username.dto";
import { Request } from "express";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(AccountEntity) private accountRepo: Repository<AccountEntity>,
    @InjectRepository(PasswordEntity) private passwordRepo: Repository<PasswordEntity>,
    @InjectRepository(TokenEntity) private userTokenRepo: Repository<TokenEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
    private googleOAuthService: GoogleOAuthService,
  ) { }

  async authenticateUser(user: UserEntity) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const payload: JwtPayloadUserDto = {
      service: JwtPayloadTypes.AUTH_USER,
      sub: user.id,
      roles: user.roles,
      iat: currentTimestamp,
      exp: currentTimestamp + this.configService.get("jwt.expiresIn", 1440) * 60,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  async getUser(userId: string) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });

    return user;
  }

  async signIn(dto: SignInDto) {
    const user = await this.userRepo.findOne({
      where: [
        { username: dto.username },
        { email: dto.username },
      ],
    });

    if (!user) {
      throw new UnauthorizedException("Not found user");
    }

    const userPassword = await this.passwordRepo.findOne({
      where: { userId: user.id },
    });

    const isPasswordMatch = userPassword && compareSync(dto.password, userPassword.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException("Username or password is not correct");
    }

    return this.authenticateUser(user);
  }

  async signUp(dto: SignUpDto) {
    const { email, name } = dto;

    const existingUser = await this.userRepo.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    const user = this.userRepo.create({
      email,
      name,
    });
    await this.userRepo.save(user);

    const userPassword = this.passwordRepo.create({
      user,
      password: hashSync(dto.password, SALT_ROUND),
    });
    this.passwordRepo.save(userPassword);

    return this.authenticateUser(user);
  }

  async getGoogleOAuth(req: Request, redirectPath: string) {
    const redirectUri = `${req.protocol}://${req.headers.host}${redirectPath}`;
    const oAuthUrl = this.googleOAuthService.generateGoogleOAuthUrl({ redirectUri });
    this.googleOAuthService.createClient(`redirect_uri:${redirectUri}`, { redirectUri });

    return {
      url: oAuthUrl,
    };
  }

  async googleOAuthCallback(req: Request) {
    const { code, error } = req.query;
    if (error) {
      throw new UnauthorizedException(`Login error: ${error}`);
    }

    if (!code || typeof code !== "string") {
      throw new BadRequestException("Authorization code is missing or has an invalid format");
    }

    const redirectUri = `${req.protocol}://${req.headers.host}${req.originalUrl}`;

    return this.signInWithGoogle({ code }, `redirect_uri:${redirectUri}`);
  }

  async signInWithGoogle(dto: GoogleOAuthDto, clientName?: string) {
    const getTokenOrThrow = async (code: string) => {
      try {
        const { tokens } = await this.googleOAuthService.getToken(code, clientName);
        if (!tokens.id_token || !tokens.access_token || !tokens.refresh_token || !tokens.token_type || !tokens.expiry_date) {
          throw new UnauthorizedException("Invalid token");
        }
        return {
          idToken: tokens.id_token,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryAt: new Date(tokens.expiry_date),
          tokenType: tokens.token_type,
        };
      }
      catch {
        throw new UnauthorizedException("Invalid code");
      }
    };

    const verifyTokenOrThrow = async (idToken: string) => {
      try {
        return await this.googleOAuthService.client.verifyIdToken({ idToken });
      }
      catch {
        throw new UnauthorizedException();
      }
    };

    const tokenData = await getTokenOrThrow(dto.code);
    const ticket = await verifyTokenOrThrow(tokenData.idToken);

    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException();
    }

    let [user, account] = await Promise.all([
      this.userRepo.findOne({
        where: {
          email: payload.email,
        },
      }),
      this.accountRepo.findOne({
        where: {
          providerAccountId: payload.sub,
          provider: AccountProviderEnum.GOOGLE,
        },
      }),
    ]);

    if (!user) {
      const newUser = this.userRepo.create({
        email: payload.email,
        name: payload.name,
        image: payload?.picture,
      });
      user = await this.userRepo.save(newUser);
    }

    if (!account) {
      const newAccount = this.accountRepo.create({
        user,
        provider: AccountProviderEnum.GOOGLE,
        providerAccountId: payload.sub,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiryAt: tokenData.expiryAt,
        idToken: tokenData.idToken,
      } as AccountEntity);

      account = await this.accountRepo.save(newAccount);
    }
    else {
      account.accessToken = tokenData.accessToken || account.accessToken;
      account.refreshToken = tokenData.refreshToken || account.refreshToken;
      account.expiryAt = tokenData.expiryAt;
      account.idToken = tokenData.idToken;

      await this.accountRepo.save(account);
    }

    return this.authenticateUser(user);
  }

  async changeUsername(userId: string, dto: ChangeUsernameDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const existingUser = await this.userRepo.findOne({
      where: {
        username: dto.username,
      },
    });

    if (existingUser) {
      throw new BadRequestException("Username already exists");
    }

    user.username = dto.username;
    await user.save();

    return true;
  }

  async getPassword(userId: string) {
    let updatedAt: Date | null = null;

    const userPassword = await this.passwordRepo.findOne({
      where: {
        userId,
      },
    });
    if (userPassword) {
      updatedAt = userPassword.updatedAt;
    }

    return {
      updatedAt,
    };
  }

  async createPassword(userId: string, dto: ChangePasswordDto) {
    const userPassword = await this.passwordRepo.findOne({
      where: {
        userId,
      },
    });

    if (userPassword) {
      throw new BadRequestException("User already has password");
    }

    const newUserPassword = this.passwordRepo.create({
      userId,
      password: hashSync(dto.newPassword, SALT_ROUND),
    });

    await this.passwordRepo.insert(newUserPassword);

    return true;
  }

  async chagePassword(userId: string, dto: ChangePasswordDto) {
    const userPassword = await this.passwordRepo.findOne({
      where: {
        userId,
      },
    });

    if (!userPassword) {
      throw new BadRequestException("User does not have password");
    }

    const isPasswordMatch = compareSync(dto.oldPassword, userPassword.password);

    if (!isPasswordMatch) {
      throw new BadRequestException("Old password is not correct");
    }

    const hashedPassword = hashSync(dto.newPassword, SALT_ROUND);
    userPassword.password = hashedPassword;
    userPassword.save();

    return true;
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new BadRequestException("User with this email not found");
    }

    const userToken = this.userTokenRepo.create({
      userId: user.id,
      token: nanoid(64),
      tokenType: TokenTypeEnum.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRATION.PASSWORD_RESET * 1000),
    });

    await userToken.save();

    const code = `${userToken.id}$${userToken.token}`;

    const resetLink = new URL(dto.endpointUrl);
    resetLink.searchParams.append("code", code);

    await this.mailerService.sendMail({
      subject: "[MePro Account] Reset Password",
      template: "password-reset.hbs",
      to: `${user.name} <${user.email}>`,
      context: {
        name: user.name,
        resetLink,
      },
    });

    return true;
  }

  async resetPasswordWithCode(dto: ResetPasswordWithCodeDto) {
    const [tokenId, token] = dto.code.split("$");

    const userToken = await this.userTokenRepo.findOne({
      where: {
        id: tokenId,
      },
    });

    if (
      !userToken
      || userToken.token !== token
      || userToken.tokenType !== TokenTypeEnum.PASSWORD_RESET
      || userToken.expiresAt < new Date()
      || userToken.revoked
    ) {
      throw new BadRequestException("Invalid Code");
    }

    userToken.revoked = true;

    const userPassword = await this.passwordRepo.findOne({
      where: {
        userId: userToken.userId,
      },
    });

    if (!userPassword) {
      throw new BadRequestException("User does not have password");
    }

    userPassword.password = hashSync(dto.newPassword, SALT_ROUND);

    await Promise.all([userToken.save(), userPassword.save()]);

    return true;
  }
}
