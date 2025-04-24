import { BaseEntity, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";
import { DomainEntity } from "./domain.entity";

@Entity("link")
export class LinkEntity extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  destination: string;

  @ManyToOne(() => DomainEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  domain: DomainEntity;

  @Column({ nullable: true })
  public: boolean;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  user: UserEntity;
}
