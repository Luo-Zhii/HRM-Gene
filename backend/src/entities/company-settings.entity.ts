import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from "typeorm";

@Entity({ name: "company_settings" })
export class CompanySettings {
  @PrimaryGeneratedColumn()
  setting_id!: number;

  @Column({ unique: true })
  key!: string;

  @Column({ type: "text" })
  value!: string;

  @UpdateDateColumn()
  updated_at!: Date;
}
