import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "announcements" })
export class Announcement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column()
  type!: string;

  @Column()
  target_audience!: string;

  @Column()
  priority!: string;

  @Column()
  status!: string;

  @Column({ type: "json", nullable: true })
  delivery_methods!: string[];

  @Column({ type: "timestamp", nullable: true })
  scheduled_at?: Date;

  @CreateDateColumn()
  created_at!: Date;
}
