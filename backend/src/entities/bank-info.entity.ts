import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Employee } from "./employee.entity";

@Entity()
export class BankInfo {
  @PrimaryGeneratedColumn()
  bank_info_id!: number;

  @OneToOne(() => Employee, (e) => e.bankInfo)
  @JoinColumn()
  employee!: Employee;

  @Column()
  bank_name!: string;

  @Column()
  account_number!: string;

  @Column()
  account_holder_name!: string;
}
