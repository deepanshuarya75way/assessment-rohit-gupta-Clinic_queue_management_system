import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './Patient';
import { Doctor } from './Doctor';

@Entity('queue')
export class Queue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  tokenNumber: string;

  @Column()
  patientId: number;

  @Column()
  doctorId: number;

  @Column({ type: 'date' })
  queueDate: string;

  @Column({ type: 'int', default: 0 })
  sequenceNumber: number;

  @Column({ type: 'varchar', length: 20, default: 'waiting' })
  status: 'waiting' | 'in-progress' | 'completed' | 'skipped';

  @Column({ nullable: true })
  calledAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'boolean', default: false })
  isWalkIn: boolean;

  @Column({ type: 'int', nullable: true })
  estimatedWaitMinutes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;
}
