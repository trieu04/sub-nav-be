import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request } from "express";
import { JwtPayloadDto, JwtPayloadUserDto } from "../dtos/jwt-payload.dto";
import { AuthenticatedUser } from "../models/authenticated-user.model";

declare module "express" {
  interface Request {
    user?: AuthenticatedUser;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  private jwtSecret?: string;
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get("jwt.secret");
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = await this.verifyToken(token).catch(() => {
      throw new UnauthorizedException("Invalid token");
    });

    const jwtPayload = await this.verifyPayload(payload, JwtPayloadUserDto).catch(() => {
      throw new UnauthorizedException("Invalid token payload");
    });

    request.user = new AuthenticatedUser({
      id: jwtPayload.sub,
      roles: jwtPayload.roles,
    });

    return true;
  }

  protected extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  protected async verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.jwtSecret,
    });
  }

  protected async verifyPayload<V, T extends JwtPayloadDto>(payload: V, cls: ClassConstructor<T>) {
    const payloadDto = plainToInstance(cls, payload);
    const errors = await validate(payloadDto);
    if (errors.length > 0) {
      throw errors;
    }

    return payloadDto;
  }
}
