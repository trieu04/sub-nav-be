import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DomainEntity } from "../../../entities/domain.entity";
import { LinkEntity } from "../../../entities/link.entity";
import { RedirectController } from "./redirect.controller";
import { RedirectService } from "./redirect.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([LinkEntity, DomainEntity]),
  ],
  controllers: [RedirectController],
  providers: [RedirectService],
  exports: [RedirectService],
})
export class RedirectModule {}
