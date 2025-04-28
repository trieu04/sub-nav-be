import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Response } from "express";
import { Repository } from "typeorm";
import { DomainEntity, DomainGroupEnum } from "../../../entities/domain.entity";
import { LinkEntity } from "../../../entities/link.entity";

@Injectable()
export class RedirectService {
  constructor(
    @InjectRepository(LinkEntity) private readonly linkRepo: Repository<LinkEntity>,
    @InjectRepository(DomainEntity) private readonly domainRepo: Repository<DomainEntity>,
  ) {}

  async handleLink(key: string, domainName: string, res: Response) {
    const destination = await this.getLink(key, domainName);
    if (!destination) {
      throw new NotFoundException("Link not found");
    }

    return res.redirect(destination);
  }

  async getLink(key: string, domainName: string) {
    const domain = await this.domainRepo.findOne({
      where: {
        name: domainName,
        group: DomainGroupEnum.LINK,
      },
    });

    if (!domain) {
      return null;
    }

    const link = await this.linkRepo.findOne({
      where: {
        key,
        domainId: domain.id,
      },
    });

    if (!link) {
      return null;
    }

    return link.destination;
  }
}
