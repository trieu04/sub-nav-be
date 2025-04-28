import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";
import { BaseEntity } from "../common/entities/base.entity";

export enum DomainTypeEnum {
  DOMAIN = "domain",
  SUBDOMAIN = "subdomain",
}

export enum DomainGroupEnum {
  PRIMARY = "primary",
  LINK = "link",
}

@Entity("domain")
export class DomainEntity extends BaseEntity {
  @Column({ nullable: true, unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: DomainTypeEnum,
    default: DomainTypeEnum.DOMAIN,
  })
  type: DomainTypeEnum;

  @Column({
    type: "enum",
    enum: DomainGroupEnum,
  })
  group: DomainGroupEnum;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  user: UserEntity;
}
