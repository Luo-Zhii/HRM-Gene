import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Employee } from "./employee.entity";

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  log_id!: number;

  @ManyToOne(() => Employee, { nullable: true })
  user?: Employee;

  @Column()
  action!: string;

  @Column()
  target_entity!: string;

  @Column({ nullable: true })
  target_id?: number;

  @CreateDateColumn()
  timestamp!: Date;
}
