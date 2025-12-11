import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Employee } from "./employee.entity";
import { PayrollPeriod } from "./payroll-period.entity";

export enum PayslipStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  PAID = "Paid",
}

@Entity()
export class Payslip {
  @PrimaryGeneratedColumn()
  payslip_id!: number;

  @ManyToOne(() => Employee)
  employee!: Employee;

  @ManyToOne(() => PayrollPeriod, (period) => period.payslips)
  payroll_period!: PayrollPeriod;

  @Column({ type: "float", default: 0 })
  actual_work_days!: number;

  @Column({ type: "float", default: 0 })
  ot_hours!: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: "0.00" })
  bonus!: string;
  
  @Column({ type: "decimal", precision: 12, scale: 2 })
  gross_salary!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: "0.00" })
  deductions!: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  net_salary!: string;

  @Column({
    type: "enum",
    enum: PayslipStatus,
    default: PayslipStatus.PENDING,
  })
  status!: PayslipStatus;

  // Legacy field for backward compatibility (can be removed later)
  @Column({ nullable: true })
  pay_period?: string; // MM/YYYY
}
