import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Employee } from "./employee.entity";
import { Contract } from "./contract.entity";

@Entity()
export class Payslip {
  @PrimaryGeneratedColumn()
  payslip_id!: number;

  @ManyToOne(() => Employee)
  employee!: Employee;

  @ManyToOne(() => Contract)
  contract!: Contract;

  @Column()
  pay_period!: string; // MM/YYYY

  @Column({ type: "decimal", precision: 12, scale: 2 })
  base_salary!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  bonus!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  deductions!: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  net_salary!: string;

  @Column()
  status!: string;
}
