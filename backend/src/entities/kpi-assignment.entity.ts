import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./employee.entity";
import { KpiPeriod } from "./kpi-period.entity";
import { KpiLibrary } from "./kpi-library.entity";

export enum KpiAssignmentStatus {
  ASSIGNED = "Assigned",
  SUBMITTED = "Submitted",
  APPROVED = "Approved",
}

@Entity()
export class KpiAssignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @ManyToOne(() => KpiPeriod, (period) => period.assignments)
  @JoinColumn({ name: "period_id" })
  period!: KpiPeriod;

  @ManyToOne(() => KpiLibrary)
  @JoinColumn({ name: "kpi_library_id" })
  kpi_library!: KpiLibrary;

  @Column({ type: "float", default: 0 })
  target_value!: number;

  @Column({ type: "float", default: 0 })
  actual_value!: number;

  @Column({ type: "int" })
  weight!: number; // Percentage, e.g., 30 for 30%

  @Column({ type: "float", nullable: true })
  manager_score?: number;

  @Column({
    type: "enum",
    enum: KpiAssignmentStatus,
    default: KpiAssignmentStatus.ASSIGNED,
  })
  status!: KpiAssignmentStatus;
}
