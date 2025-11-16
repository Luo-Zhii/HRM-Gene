import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Employee } from "./employee.entity";

@Entity()
export class TimeKeeping {
  @PrimaryGeneratedColumn()
  timekeeping_id!: number;

  @ManyToOne(() => Employee)
  employee!: Employee;

  @Column({ type: "timestamp" })
  check_in_time!: Date;

  @Column({ type: "timestamp", nullable: true })
  check_out_time?: Date;

  @Column({ type: "date" })
  work_date!: string;

  @Column({ type: "double precision", default: 0 })
  hours_worked!: number;

  @Column()
  status!: string;

  @Column({ nullable: true })
  ip_address?: string;

  @Column({ nullable: true })
  qr_payload?: string;
}
