import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Employee } from "./employee.entity";

export enum ViolationStatus {
  PENDING = "Pending",
  RESOLVED = "Resolved",
}

export enum ViolationSeverity {
  LOW = "Low",
  NORMAL = "Normal",
  HIGH = "High",
}

@Entity()
export class Violation {
  @PrimaryGeneratedColumn()
  violation_id!: number;

  @ManyToOne(() => Employee)
  employee!: Employee;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  violation_date!: Date;

  @Column()
  violation_type!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "decimal", precision: 15, scale: 2, default: "0.00" })
  deduction_amount!: string;

  @Column({
    type: "enum",
    enum: ViolationSeverity,
    default: ViolationSeverity.NORMAL,
  })
  severity!: ViolationSeverity;

  @Column({
    type: "enum",
    enum: ViolationStatus,
    default: ViolationStatus.PENDING,
  })
  status!: ViolationStatus;
}

