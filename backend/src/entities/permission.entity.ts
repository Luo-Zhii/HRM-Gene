import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PositionPermission } from "./position-permission.entity";

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  permission_id!: number;

  @Column()
  permission_name!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  module_group?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  method?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  apiPath?: string;

  @OneToMany(() => PositionPermission, (pp) => pp.permission)
  positions?: PositionPermission[];
}
