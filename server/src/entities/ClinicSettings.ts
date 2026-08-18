import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('clinic_settings')
export class ClinicSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  clinicName: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'json', nullable: true })
  workingHours: Record<string, { start: string; end: string }>;

  @Column({ type: 'json', nullable: true })
  holidays: string[];

  @Column({ type: 'int', default: 10 })
  defaultConsultationMinutes: number;

  @Column({ type: 'int', default: 0 })
  tokenCounter: number;

  @Column({ type: 'date', nullable: true })
  tokenCounterDate: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
