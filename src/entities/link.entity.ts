import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";
import { DomainEntity } from "./domain.entity";
import { BaseEntity } from "../common/entities/base.entity";
import { LinkPatternEnum } from "../modules/link/libs/link-pattern";

@Entity("link")
export class LinkEntity extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  destination: string;

  @Column({ nullable: true })
  key: string;

  @Column({ nullable: true, enum: LinkPatternEnum })
  pattern: LinkPatternEnum;

  @ManyToOne(() => DomainEntity, { nullable: true })
  @JoinColumn()
  domain: DomainEntity;

  @Column({ nullable: true })
  domainId: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  user: UserEntity;

  @Column({ nullable: true })
  userId: string;
}
