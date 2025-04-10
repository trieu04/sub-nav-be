import { JwtPayloadDto } from "./dtos/jwt-payload.dto";

declare module "express" {
  interface Request {
    jwtPayload: JwtPayloadDto | undefined;
  }
}
