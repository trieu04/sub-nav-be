import { Crud, CrudController } from "@dataui/crud";
import { Controller, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { DomainEntity } from "../../../entities/domain.entity";
import { UserRoleEnum } from "../../../entities/user.entity";
import { Roles } from "../../auth/decorators/roles.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { DomainsCrudService } from "./domains-crud.service";
import { CreateDomainDto, DomainDto, UpdateDomainDto } from "./dtos/domain.dto";

@Controller("domains")
@ApiTags("Domains")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles([UserRoleEnum.ADMIN])
@Crud({
  model: {
    type: DomainDto,
  },
  routes: {
    only: ["createOneBase", "getOneBase", "getManyBase", "updateOneBase", "deleteOneBase"],
  },
  dto: {
    create: CreateDomainDto,
    update: UpdateDomainDto,
  },
})
export class DomainsCrudController implements CrudController<DomainEntity> {
  constructor(public service: DomainsCrudService) {}
}
