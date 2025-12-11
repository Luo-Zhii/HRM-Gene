import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Payslip } from "./payslip.entity";

export enum PayrollPeriodStatus {
  DRAFT = "Draft",
  LOCKED = "Locked",
  PAID = "Paid",
}

@Entity()
export class PayrollPeriod {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  month!: number; // 1-12

  @Column({ type: "int" })
  year!: number;

  @Column({
    type: "enum",
    enum: PayrollPeriodStatus,
    default: PayrollPeriodStatus.DRAFT,
  })
  status!: PayrollPeriodStatus;

  @Column({ type: "int", default: 26 })
  standard_work_days!: number;

  @OneToMany(() => Payslip, (payslip) => payslip.payroll_period)
  payslips?: Payslip[];
}

