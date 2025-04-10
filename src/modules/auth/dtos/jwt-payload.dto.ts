import { IsInt, IsNumber, Validate } from "class-validator";

export class JwtPayloadDto {
  @IsNumber()
  sub: string;

  @IsInt()
  iat: number;

  @IsInt()
  @Validate((exp: number) => exp > Math.floor(Date.now() / 1000), {
    message: "Token has expired",
  })
  exp: number;
}
