import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Employee } from "./employee.entity";

export enum AdjustmentType {
  BONUS = "Bonus",
  PENALTY = "Penalty",
}

export enum AdjustmentStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

@Entity()
export class SalaryAdjustment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee, { eager: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({
    type: "enum",
    enum: AdjustmentType,
    default: AdjustmentType.BONUS,
  })
  type!: AdjustmentType;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount!: string;

  /** Format: "MM/YYYY" e.g. "10/2023" */
  @Column({ length: 10 })
  applied_month!: string;

  @Column({ type: "text", nullable: true })
  reason!: string;

  @Column({
    type: "enum",
    enum: AdjustmentStatus,
    default: AdjustmentStatus.PENDING,
  })
  status!: AdjustmentStatus;

  @CreateDateColumn()
  created_at!: Date;

  /** Who created – store employee_id of the HR/Admin user */
  @Column({ nullable: true })
  created_by_id!: number;
}
