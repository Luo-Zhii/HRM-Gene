import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export enum HolidayType {
  NATIONAL = "national",
  COMPANY = "company",
  OPTIONAL = "optional",
}

@Entity()
export class PublicHoliday {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "date" })
  date!: string; // ISO date string: YYYY-MM-DD

  @Column({ type: "date", nullable: true })
  end_date?: string; // For multi-day holidays

  @Column({
    type: "varchar",
    length: 50,
    default: HolidayType.NATIONAL,
  })
  type!: string; // 'national', 'company', 'optional'

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "boolean", default: true })
  is_recurring!: boolean; // Repeat every year

  @Column({ type: "int", default: new Date().getFullYear() })
  year!: number;

  @CreateDateColumn()
  created_at!: Date;
}
