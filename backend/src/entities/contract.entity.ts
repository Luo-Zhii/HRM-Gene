import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Employee } from "./employee.entity";

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  contract_id!: number;

  @ManyToOne(() => Employee, (e) => e.contracts)
  employee!: Employee;

  @Column()
  contract_type!: string;

  @Column({ type: "date" })
  start_date!: string;

  @Column({ type: "date", nullable: true })
  end_date?: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  base_salary!: string;

  @Column({ nullable: true })
  file_url?: string;
}
