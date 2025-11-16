import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Employee } from "./employee.entity";
import { LeaveType } from "./leave-type.entity";

@Entity()
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  request_id!: number;

  @ManyToOne(() => Employee)
  employee!: Employee;

  @ManyToOne(() => LeaveType)
  leave_type!: LeaveType;

  @Column({ type: "date" })
  start_date!: string;

  @Column({ type: "date" })
  end_date!: string;

  @Column({ type: "text", nullable: true })
  reason?: string;

  @Column()
  status!: string; // 'Pending', 'Approved_By_Manager', 'Approved', 'Rejected'

  @ManyToOne(() => Employee, { nullable: true })
  manager_approver?: Employee;
}
