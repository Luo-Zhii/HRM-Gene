import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Exclude } from "class-transformer";
import { Department } from "./department.entity";
import { Position } from "./position.entity";
import { BankInfo } from "./bank-info.entity";
import { Contract } from "./contract.entity";

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  employee_id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @ManyToOne(() => Department, (d) => d.employees, { nullable: true })
  department?: Department;

  @ManyToOne(() => Position, (p) => p.employees, { nullable: true })
  position?: Position;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ nullable: true })
  phone_number?: string;

  @Column({ nullable: true })
  address?: string;

  @OneToOne(() => BankInfo, (b) => b.employee, { cascade: true })
  bankInfo?: BankInfo;

  @OneToMany(() => Contract, (c) => c.employee)
  contracts?: Contract[];

  @Column({ nullable: true, type: "text" })
  description?: string;

  @Column({ default: true })
  email_notifications!: boolean;

  @Column({ default: true })
  push_reminders!: boolean;

  @Column({ default: true })
  push_announcements!: boolean;

  @Column({ default: true })
  push_daily_reports!: boolean;

  @Column({ default: false })
  dark_mode!: boolean;

  @Column({ default: "en" })
  language!: string;
}
