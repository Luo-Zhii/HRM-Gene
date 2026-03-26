import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { KpiAssignment } from "./kpi-assignment.entity";

export enum KpiPeriodStatus {
  DRAFT = "Draft",
  ACTIVE = "Active",
  LOCKED = "Locked",
}

@Entity()
export class KpiPeriod {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string; // e.g., "Jan 2026"

  @Column({ type: "date" })
  start_date!: string;

  @Column({ type: "date" })
  end_date!: string;

  @Column({
    type: "enum",
    enum: KpiPeriodStatus,
    default: KpiPeriodStatus.DRAFT,
  })
  status!: KpiPeriodStatus;

  @OneToMany(() => KpiAssignment, (assignment) => assignment.period)
  assignments?: KpiAssignment[];
}
