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
import { UserPasswordEntity } from "../../entities/user-password";
import { TokenTypeEnum, UserTokenEntity } from "../../entities/user-token";
import { UserEntity } from "../../entities/user.entity";
import { GoogleOauthService } from "../google-oauth/google-oauth.service";
import { MailService } from "../mail/mail.service";
import { ChangePasswordDto } from "./dtos/change-password.dto";
import { GoogleOAuthDto } from "./dtos/google-oauth.dto";
import { MailResetPasswordDto, ResetPasswordConfirmDto } from "./dtos/reset-password.dto";
import { SignInDto } from "./dtos/sign-in.dto";
import { SignUpDto } from "./dtos/sign-up.dto";
import { JwtPayloadAuthDto } from "./dtos/jwt-payload-auth.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(AccountEntity) private accountRepo: Repository<AccountEntity>,
    @InjectRepository(UserPasswordEntity) private userPasswordRepo: Repository<UserPasswordEntity>,
    @InjectRepository(UserTokenEntity) private userTokenRepo: Repository<UserTokenEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private mailerService: MailerService,
    private googleOAuthService: GoogleOauthService,
  ) { }

  async authenticateUser(user: UserEntity) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const payload: JwtPayloadAuthDto = {
      service: "auth",
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

  async signIn(dto: SignInDto) {
    let user: UserEntity | undefined | null = await this.userRepo.findOne({
      where: [
        { username: dto.username },
        { email: dto.username },
      ],
    });

    if (!user) {
      const account = await this.accountRepo.findOne({
        where: { email: dto.username },
        relations: {
          user: true,
        },
      });
      user = account?.user;
    }

    if (!user) {
      throw new UnauthorizedException("Not found account");
    }

    const userPassword = await this.userPasswordRepo.findOne({
      where: { userId: user.id },
    });

    const isPasswordMatch = userPassword && compareSync(dto.password, userPassword.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException("Username or password is not correct");
    }

    return this.authenticateUser(user);
  }

  async signUp(dto: SignUpDto) {
    const existingUser = await this.accountRepo.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException("User already exists");
    }

    const user = this.userRepo.create({
      email: dto.email,
      name: dto.name,
    });
    await this.userRepo.save(user);

    const account = this.accountRepo.create({
      user,
      provider: AccountProviderEnum.LOCAL,
      email: dto.email,
    });
    const userPassword = this.userPasswordRepo.create({
      user,
      password: hashSync(dto.password, SALT_ROUND),
    });
    await Promise.all([
      this.accountRepo.save(account),
      this.userPasswordRepo.save(userPassword),
    ]);

    return this.authenticateUser(user);
  }

  async googleSignIn(dto: GoogleOAuthDto) {
    const { tokens } = await this.googleOAuthService.getToken(dto.code).catch(() => {
      throw new UnauthorizedException("Invalid code");
    });

    const ticket = await this.googleOAuthService.verifyIdToken({ idToken: tokens.id_token ?? "" }).catch(() => {
      throw new UnauthorizedException();
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new UnauthorizedException();
    }

    let user = await this.userRepo.findOne({
      where: {
        email: payload.email,
      },
    });

    let account = await this.accountRepo.findOne({
      where: {
        providerAccountId: payload.sub,
        provider: AccountProviderEnum.GOOGLE,
      },
    });

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
        email: payload.email ?? null,
        emailVerified: payload.email_verified ?? null,
        accessToken: tokens.access_token ?? null,
        refreshToken: tokens.refresh_token ?? null,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        tokenType: tokens.token_type ?? null,
        scope: tokens.scope ?? null,
        idToken: tokens.id_token ?? null,
      } as AccountEntity);

      account = await newAccount.save();
    }

    else {
      Object.assign(account, {
        email: payload.email ?? account.email,
        emailVerified: payload.email_verified ?? account.emailVerified,
        accessToken: tokens.access_token ?? account.accessToken,
        refreshToken: tokens.refresh_token ?? account.refreshToken,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : account.expiryDate,
        tokenType: tokens.token_type ?? account.tokenType,
        scope: tokens.scope ?? account.scope,
        idToken: tokens.id_token ?? account.idToken,
      });
      await this.accountRepo.save(account);
    }

    return this.authenticateUser(user);
  }

  async getPassword(userId: string) {
    const userPassword = await this.userPasswordRepo.findOne({
      where: {
        userId,
      },
    });

    const { updatedAt } = userPassword ?? { updatedAt: null };

    return {
      updatedAt,
    };
  }

  async createPassword(dto: ChangePasswordDto, userId: string) {
    const userPassword = await this.userPasswordRepo.findOne({
      where: {
        userId,
      },
    });

    if (userPassword) {
      throw new BadRequestException("User already has password");
    }

    const newUserPassword = this.userPasswordRepo.create({
      userId,
      password: hashSync(dto.newPassword, SALT_ROUND),
    });

    await this.userPasswordRepo.insert(newUserPassword);

    return true;
  }

  async chagePassword(dto: ChangePasswordDto, userId: string) {
    const userPassword = await this.userPasswordRepo.findOne({
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

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });

    return user;
  }

  async mailResetPassword(dto: MailResetPasswordDto) {
    const account = await this.accountRepo.findOne({
      where: {
        email: dto.email,
      },
      relations: {
        user: true,
      },
    });

    if (!account) {
      throw new BadRequestException("User with this email not found");
    }

    const { user } = account;

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

    const result = await this.mailerService.sendMail({
      subject: "[MePro Account] Reset Password",
      template: "password-reset.hbs",
      to: account.email,
      context: {
        name: user.name,
        resetLink,
      },
    });

    await this.mailService.saveSentEmail(result);

    return true;
  }

  async resetPasswordConfirm(dto: ResetPasswordConfirmDto) {
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

    const userPassword = await this.userPasswordRepo.findOne({
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
