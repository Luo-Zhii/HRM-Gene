import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Employee } from "./employee.entity";

export enum NotificationType {
  LEAVE = "leave",
  LEAVE_REQUEST = "leave_request",
  TASK = "task",
  ANNOUNCEMENT = "announcement",
  REPORT = "report",
  DISCIPLINE = "discipline",
  WARNING = "warning",
  PAYROLL = "payroll",
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({
    type: "enum",
    enum: NotificationType,
    default: NotificationType.ANNOUNCEMENT,
  })
  type!: NotificationType;

  @Column({ default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Employee, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: Employee;

  @Column()
  userId!: number;
}
