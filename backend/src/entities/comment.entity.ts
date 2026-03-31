import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Employee } from "./employee.entity";

@Entity({ name: "comments" })
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  entityType!: string; // e.g., 'LEAVE_REQUEST', 'RESIGNATION', 'PAYROLL'

  @Column()
  entityId!: string;

  @Column()
  authorId!: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "authorId" })
  author!: Employee;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
