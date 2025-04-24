import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/entities/base.entity";
import { UserEntity } from "./user.entity";

export enum AccountProviderEnum {
  GOOGLE = "google",
  LOCAL = "local",
}

@Entity("account")
export class AccountEntity extends BaseEntity {
  @Column({ enum: AccountProviderEnum })
  provider: string;

  @Column({ nullable: true })
  providerAccountId: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  expiryAt: Date;

  @Column({ nullable: true })
  idToken: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  user: UserEntity;
}
