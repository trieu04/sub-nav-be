import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DomainEntity } from "../../../entities/domain.entity";
import { LinkEntity } from "../../../entities/link.entity";
import { LinksCrudController } from "./links-crud.controller";
import { LinksCrudService } from "./links-crud.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([LinkEntity, DomainEntity]),
  ],
  controllers: [LinksCrudController],
  providers: [LinksCrudService],
})
export class LinksCrudModule {}
