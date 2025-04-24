import { Equals, IsIn, IsInt, IsString, Validate } from "class-validator";
import { UserRoleEnum } from "../../../entities/user.entity";

export class JwtPayloadDto {
  @IsString()
  sub: string;

  @IsInt()
  iat: number;

  @IsInt()
  @Validate((exp: number) => exp > Math.floor(Date.now() / 1000), {
    message: "Token has expired",
  })
  exp: number;
}

export class JwtPayloadAuthDto extends JwtPayloadDto {
  @Equals("auth")
  service: "auth";

  @IsIn(Object.values(UserRoleEnum), { each: true })
  roles: UserRoleEnum[];
}
