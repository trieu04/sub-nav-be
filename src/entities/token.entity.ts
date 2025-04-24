import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/entities/base.entity";
import { UserEntity } from "./user.entity";

export enum TokenTypeEnum {
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_RESET = "password_reset",
}

@Entity("user_token")
export class TokenEntity extends BaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  user: UserEntity;

  @Column()
  token: string;

  @Column({ enum: TokenTypeEnum, nullable: true })
  tokenType: string;

  @Column(({ default: false }))
  revoked: boolean;

  @Column()
  expiresAt: Date;
}
