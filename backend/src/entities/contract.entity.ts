import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Employee } from "./employee.entity";

export enum ContractType {
  PROBATION = "Probation",
  OFFICIAL = "Official",
  PART_TIME = "Part-time",
}

export enum ContractStatus {
  ACTIVE = "Active",
  EXPIRED = "Expired",
  TERMINATED = "Terminated",
}

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  contract_id!: number;

  @ManyToOne(() => Employee, (e) => e.contracts)
  employee!: Employee;

  @Column({ nullable: true })
  contract_number!: string;

  @Column({
    type: "enum",
    enum: ContractType,
  })
  contract_type!: ContractType;

  @Column({ type: "date" })
  start_date!: string;

  @Column({ type: "date", nullable: true })
  end_date?: string;

  @Column({
    type: "enum",
    enum: ContractStatus,
    default: ContractStatus.ACTIVE,
  })
  status!: ContractStatus;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  salary_rate!: string;

  @Column({ nullable: true })
  file_url?: string;
}
