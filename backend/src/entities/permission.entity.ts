import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PositionPermission } from "./position-permission.entity";

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  permission_id!: number;

  @Column()
  permission_name!: string;

  @OneToMany(() => PositionPermission, (pp) => pp.permission)
  positions?: PositionPermission[];
}
