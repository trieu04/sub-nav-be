import { Column, Entity } from "typeorm";
import { BaseEntity } from "../common/entities/base.entity";

export enum UserRoleEnum {
  ADMIN = "admin",
  USER = "user",
}

@Entity("user")
export class UserEntity extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  username: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  image: string;

  @Column({
    type: "enum",
    array: true,
    enum: UserRoleEnum,
    default: [UserRoleEnum.USER],
  })
  roles: UserRoleEnum[];
}
