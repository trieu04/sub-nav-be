import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "../common/entities/base.entity";
import { UserEntity } from "./user.entity";

@Entity("user_password")
export class PasswordEntity extends BaseEntity {
  @Column()
  password: string;

  @Column()
  userId: string;

  @OneToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  user: UserEntity;
}
