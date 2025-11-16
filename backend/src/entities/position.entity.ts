import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Employee } from "./employee.entity";
import { PositionPermission } from "./position-permission.entity";

@Entity()
export class Position {
  @PrimaryGeneratedColumn()
  position_id!: number;

  @Column({ unique: true })
  position_name!: string;

  @OneToMany(() => Employee, (e) => e.position)
  employees?: Employee[];

  @OneToMany(() => PositionPermission, (pp) => pp.position)
  permissions?: PositionPermission[];
}
