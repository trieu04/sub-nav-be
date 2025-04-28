import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRoleEnum } from "../../entities/user.entity";
import { Roles } from "../auth/decorators/roles.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { MailService } from "./mail.service";

@Controller("mail")
@ApiTags("mail")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles([UserRoleEnum.ADMIN])
export class MailController {
  constructor(private service: MailService) { }

  @Get("send-test")
  sendMail(@Query("email") email: string) {
    return this.service.sendTestEmail(email);
  }
}
