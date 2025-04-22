import { BaseEntity, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";

export enum DomainType {
  DOMAIN = "domain",
  SUBDOMAIN = "subdomain",
}

@Entity("domain")
export class DomainEntity extends BaseEntity {
  @Column({ nullable: true })
  domainName: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: "enum",
    enum: DomainType,
    default: DomainType.DOMAIN,
  })
  type: DomainType;

  @ManyToOne(() => DomainEntity, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  domain: DomainEntity;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  user: UserEntity;
}
