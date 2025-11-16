import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Employee } from "./employee.entity";
import { LeaveType } from "./leave-type.entity";

@Entity()
export class LeaveBalance {
  @PrimaryGeneratedColumn()
  balance_id!: number;

  @ManyToOne(() => Employee)
  employee!: Employee;

  @ManyToOne(() => LeaveType)
  leave_type!: LeaveType;

  @Column({ type: "float", default: 0 })
  remaining_days!: number;
}
