import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DomainEntity } from "../../../entities/domain.entity";
import { DomainsCrudController } from "./domains-crud.controller";
import { DomainsCrudService } from "./domains-crud.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([DomainEntity]),
  ],
  controllers: [DomainsCrudController],
  providers: [DomainsCrudService],
})
export class DomainsCrudModule {}
