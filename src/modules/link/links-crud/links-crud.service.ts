import { CrudRequest, CrudService, GetManyDefaultResponse } from "@dataui/crud";
import { TypeOrmCrudService } from "@dataui/crud-typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DomainEntity, DomainGroupEnum } from "../../../entities/domain.entity";
import { LinkEntity } from "../../../entities/link.entity";
import { AuthenticatedUser } from "../../auth/models/authenticated-user.model";
import { CreateLinkDto, UpdateLinkDto } from "./dtos/link.dto";
import { buildLinkFromPattern, LinkPatternEnum } from "../libs/link-pattern";

@Injectable()
export class LinksCrudService extends TypeOrmCrudService<LinkEntity> implements CrudService<LinkEntity> {
  private readonly linkPrefix = "l-";
  constructor(
    @InjectRepository(LinkEntity) public linkRepo: Repository<LinkEntity>,
    @InjectRepository(DomainEntity) public domainRepo: Repository<DomainEntity>,
  ) {
    super(linkRepo);
  }

  async getManyCustom(req: CrudRequest) {
    const builder = await this.createBuilder(req.parsed, req.options);
    const [data, total] = await builder.getManyAndCount();
    const limit = builder.expressionMap.take;
    const offset = builder.expressionMap.skip;

    const formattedLinks = data.map((link) => {
      return {
        ...link,
        url: this.getUrl(link),
      };
    });

    return this.createPageInfo(formattedLinks, total, limit || total, offset || 0);
  }

  async getOneCustom(req: CrudRequest) {
    const builder = await this.createBuilder(req.parsed, req.options);
    const link = await builder.getOne();
    if (!link) {
      throw new BadRequestException("Link not found");
    }
    return {
      ...link,
      url: this.getUrl(link),
    };
  }

  async createOneCustom(user: AuthenticatedUser, req: CrudRequest, dto: CreateLinkDto) {
    const { name, description, destination, domainName, key } = dto;

    const domain = await this.domainRepo.findOne({
      where: { name: domainName },
    });

    if (!domain)
      throw new BadRequestException("Domain not found");

    let linkKey: string;
    if (key) {
      const existingLink = await this.linkRepo.findOne({
        where: { domainId: domain.id, key },
      });

      if (existingLink) {
        throw new BadRequestException("Link key already exists for this domain");
      }

      linkKey = key;
    }
    else {
      while (true) {
        const randomKey = Math.random().toString(36).substring(2, 10);
        const existingLink = await this.linkRepo.findOne({
          where: { domainId: domain.id, key: randomKey },
        });

        if (!existingLink) {
          linkKey = randomKey;
          break;
        }
      }
    }

    const linkPattern = domain.group === DomainGroupEnum.PRIMARY
      ? LinkPatternEnum.PREFIX
      : LinkPatternEnum.DIRECT;

    const newLink = this.linkRepo.create({
      name,
      description,
      destination,
      domain,
      user,
      key: linkKey,
      pattern: linkPattern,
    });

    await this.linkRepo.save(newLink);

    return {
      ...newLink,
      url: this.getUrl(newLink),
    };
  }

  async updateOneCustom(user: AuthenticatedUser, req: CrudRequest, dto: UpdateLinkDto) {
    const id = req.parsed.paramsFilter.find(f => f.field === "id")?.value;
    const { name, description, destination, domainName, key } = dto;

    const link = await this.linkRepo.findOne({
      where: { id, userId: user.id },
    });

    if (!link) {
      throw new BadRequestException("Link not found");
    }

    if (name !== undefined) {
      link.name = name;
    }
    if (description !== undefined) {
      link.description = description;
    }
    if (key !== undefined) {
      link.key = key;
    }
    if (destination !== undefined) {
      link.destination = destination;
    }

    // If domainName changes, verify the new domain
    if (domainName) {
      const domain = await this.domainRepo.findOne({
        where: { name: domainName },
      });

      if (!domain) {
        throw new BadRequestException("Domain not found");
      }

      // If changing domain, check if the user already has a link with that domain
      if (domain.id !== link.domainId) {
        const existingLink = await this.linkRepo.findOne({
          where: { domainId: domain.id, key: link.key },
        });

        if (existingLink) {
          throw new BadRequestException("Link key already exists for this domain");
        }

        link.domainId = domain.id;

        link.pattern = domain.group === DomainGroupEnum.PRIMARY
          ? LinkPatternEnum.PREFIX
          : LinkPatternEnum.DIRECT;
      }
    }

    await this.linkRepo.save(link);

    return link;
  }

  private getUrl(link: LinkEntity) {
    if (link.pattern === LinkPatternEnum.DIRECT) {
      return buildLinkFromPattern(link.pattern, { key: link.key, domain: link.domain.name });
    }
    else if (link.pattern === LinkPatternEnum.PREFIX) {
      return buildLinkFromPattern(link.pattern, { key: link.key, domain: link.domain.name, prefix: this.linkPrefix });
    }
    else {
      return null;
    }
  }

  createPageInfo<T>(data: T[], total: number, limit: number, offset: number): GetManyDefaultResponse<T> {
    return {
      data,
      count: data.length,
      total,
      page: limit ? Math.floor(offset / limit) + 1 : 1,
      pageCount: limit && total ? Math.ceil(total / limit) : 1,
    };
  }
}
