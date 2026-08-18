import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 100, nullable: true })
  specialization: string;

  @Column({ type: 'json', nullable: true })
  workingHours: Record<string, { start: string; end: string }>;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'on-leave' | 'break';

  @Column({ nullable: true })
  departmentId: number;

  @Column({ type: 'int', default: 10 })
  avgConsultationMinutes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
