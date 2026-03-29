import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from "typeorm";

@Entity({ name: "company_profile" })
export class CompanyProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: "My Company" })
  company_name!: string;

  @Column({ nullable: true })
  tax_id?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  zip?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ default: "USD" })
  base_currency!: string;

  @Column({ nullable: true })
  secondary_currency?: string;

  @Column({ nullable: true })
  logo_url?: string;

  @UpdateDateColumn()
  updated_at!: Date;
}
