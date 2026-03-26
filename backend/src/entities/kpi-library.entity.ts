import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Employee } from "./employee.entity";

export enum KpiUnit {
  PERCENT = "Percent",
  NUMBER = "Number",
  VND = "VND",
  USD = "USD",
}

@Entity()
export class KpiLibrary {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "text", nullable: true })
  calculation_formula?: string;

  @Column({
    type: "enum",
    enum: KpiUnit,
    default: KpiUnit.PERCENT,
  })
  unit!: KpiUnit;

  @ManyToOne(() => Employee)
  created_by!: Employee;
}
