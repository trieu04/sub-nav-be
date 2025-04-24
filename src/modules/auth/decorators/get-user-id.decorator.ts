import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";
import { JwtPayloadAuthDto } from "../dtos/jwt-payload.dto";

export const GetUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { jwtPayload } = request;
    if (jwtPayload instanceof JwtPayloadAuthDto) {
      return jwtPayload.sub;
    }
    return null;
  },
);
