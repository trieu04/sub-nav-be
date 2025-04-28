import { TypeOrmCrudService } from "@dataui/crud-typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DomainEntity } from "../../../entities/domain.entity";

@Injectable()
export class DomainsCrudService extends TypeOrmCrudService<DomainEntity> {
  constructor(@InjectRepository(DomainEntity) repo: Repository<DomainEntity>) {
    super(repo);
  }
}
