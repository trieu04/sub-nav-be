import { Crud, CrudAuth, CrudController, CrudRequest, Override, ParsedRequest } from "@dataui/crud";
import { Body, Controller, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { LinkEntity } from "../../../entities/link.entity";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { AuthenticatedUser } from "../../auth/models/authenticated-user.model";
import { CreateLinkDto, LinkDto, UpdateLinkDto } from "./dtos/link.dto";
import { LinksCrudService } from "./links-crud.service";
import { GetUser } from "../../auth/decorators/get-user.decorator";

@Controller("links")
@ApiTags("Links")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Crud({
  model: {
    type: LinkDto,
  },
  routes: {
    only: ["createOneBase", "getOneBase", "getManyBase", "updateOneBase", "deleteOneBase"],
  },
  query: {
    join: {
      domain: {
        eager: true,
      },
    },
  },
})
@CrudAuth({
  property: "user",
  filter: (user) => {
    if (user instanceof AuthenticatedUser) {
      return {
        userId: user.id,
      };
    }
    throw new UnauthorizedException();
  },
})
export class LinksCrudController implements CrudController<LinkEntity> {
  constructor(public service: LinksCrudService) {}

  @Override("getManyBase")
  getManyCustom(@ParsedRequest() req: CrudRequest) {
    return this.service.getManyCustom(req);
  }

  @Override("getOneBase")
  getOneCustom(@ParsedRequest() req: CrudRequest) {
    return this.service.getOneCustom(req);
  }

  @Override("createOneBase")
  @UsePipes(ValidationPipe)
  createOneCustom(@GetUser() user: AuthenticatedUser, @ParsedRequest() req: CrudRequest, @Body() dto: CreateLinkDto) {
    return this.service.createOneCustom(user, req, dto);
  }

  @Override("updateOneBase")
  @UsePipes(ValidationPipe)
  updateOneCustom(@GetUser() user: AuthenticatedUser, @ParsedRequest() req: CrudRequest, @Body() dto: UpdateLinkDto) {
    return this.service.updateOneCustom(user, req, dto);
  }
}
