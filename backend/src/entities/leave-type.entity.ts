import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class LeaveType {
  @PrimaryGeneratedColumn()
  leave_type_id!: number;

  @Column()
  name!: string;

  @Column({ type: "int", default: 0 })
  default_days_allocated!: number;
}
