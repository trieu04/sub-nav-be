import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { UserRoleEnum } from "../../../entities/user.entity";
import { JwtPayloadAuthDto } from "../dtos/jwt-payload.dto";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { jwtPayload } = request;

    if (jwtPayload instanceof JwtPayloadAuthDto) {
      return jwtPayload.roles.includes(UserRoleEnum.ADMIN);
    }

    return false;
  }
}
