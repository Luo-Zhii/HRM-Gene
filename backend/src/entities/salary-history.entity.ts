import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Employee } from "./employee.entity";

@Entity()
export class SalaryHistory {
  @PrimaryGeneratedColumn()
  history_id!: number;

  @ManyToOne(() => Employee)
  employee!: Employee;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  old_salary!: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  new_salary!: string;

  @Column({ type: "date" })
  change_date!: string;

  @Column({ type: "text", nullable: true })
  reason?: string;
}

