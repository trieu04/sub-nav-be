import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";
import { JwtPayloadAuthDto } from "../dtos/jwt-payload.dto";

export interface IAuthenticatedUser {
  id: string;
  roles: string[];
}

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { jwtPayload } = request;
    if (jwtPayload instanceof JwtPayloadAuthDto) {
      return {
        id: jwtPayload.sub,
        roles: jwtPayload.roles,
      } as IAuthenticatedUser;
    }
    return null;
  },
);
