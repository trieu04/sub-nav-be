import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request } from "express";
import { JwtPayloadDto } from "../dtos/jwt-payload.dto";
import { JwtPayloadAuthDto } from "../dtos/jwt-payload-auth.dto";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = await this.verifyToken(token).catch(() => {
      throw new UnauthorizedException("Invalid token");
    });

    const jwtPayload = await this.verifyPayload(payload, JwtPayloadAuthDto).catch((err) => {
      throw new UnauthorizedException(err.message);
    });

    request.jwtPayload = jwtPayload;
    return true;
  }

  protected extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  protected async verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get("jwt.secret"),
    });
  }

  protected async verifyPayload<V, T extends JwtPayloadDto>(payload: V, cls: ClassConstructor<T>) {
    const payloadDto = plainToInstance(cls, payload);
    const errors = await validate(payloadDto);
    if (errors.length > 0) {
      throw new Error("Invalid token");
    }

    return payloadDto;
  }
}
