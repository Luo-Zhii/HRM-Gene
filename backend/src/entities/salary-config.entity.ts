import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Employee } from "./employee.entity";

@Entity()
export class SalaryConfig {
  @PrimaryGeneratedColumn()
  config_id!: number;

  @OneToOne(() => Employee, { onDelete: "CASCADE" })
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  base_salary!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: "0.00" })
  transport_allowance!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: "0.00" })
  lunch_allowance!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: "0.00" })
  responsibility_allowance!: string;
}

