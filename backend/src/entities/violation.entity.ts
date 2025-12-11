import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Employee } from "./employee.entity";

export enum ViolationStatus {
  PENDING = "Pending",
  RESOLVED = "Resolved",
}

@Entity()
export class Violation {
  @PrimaryGeneratedColumn()
  violation_id!: number;

  @ManyToOne(() => Employee)
  employee!: Employee;

  @Column({ type: "date" })
  date!: string;

  @Column()
  violation_type!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: "0.00" })
  penalty_amount!: string;

  @Column({
    type: "enum",
    enum: ViolationStatus,
    default: ViolationStatus.PENDING,
  })
  status!: ViolationStatus;
}

