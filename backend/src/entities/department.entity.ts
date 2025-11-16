import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Employee } from "./employee.entity";

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  department_id!: number;

  @Column()
  department_name!: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: "manager_id" })
  manager!: Employee;

  @OneToMany(() => Employee, (e) => e.department)
  employees!: Employee[];
}
