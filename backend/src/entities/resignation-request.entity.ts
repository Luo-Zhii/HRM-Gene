import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';

export enum ResignationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  WITHDRAWN = 'Withdrawn'
}

@Entity('resignation_request')
export class ResignationRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ name: 'employee_id' })
  employee_id!: number;

  @Column({ type: 'text' })
  reason_text!: string;

  @Column({ type: 'date' })
  requested_last_day!: string;

  @Column({ type: 'enum', enum: ResignationStatus, default: ResignationStatus.PENDING })
  status!: ResignationStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
