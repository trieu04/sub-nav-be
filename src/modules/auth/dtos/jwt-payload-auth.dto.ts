import { Equals, IsIn } from "class-validator";
import { UserRoleEnum } from "../../../entities/user.entity";
import { JwtPayloadDto } from "./jwt-payload.dto";

export class JwtPayloadAuthDto extends JwtPayloadDto {
  @Equals("auth")
  service: "auth";

  @IsIn(Object.values(UserRoleEnum), { each: true })
  roles: UserRoleEnum[];
}
