import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';
import { User } from '../entities/User';
import { Patient } from '../entities/Patient';
import { Doctor } from '../entities/Doctor';
import { Appointment } from '../entities/Appointment';
import { Queue } from '../entities/Queue';
import { Visit } from '../entities/Visit';
import { Department } from '../entities/Department';
import { ClinicSettings } from '../entities/ClinicSettings';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Patient, Doctor, Appointment, Queue, Visit, Department, ClinicSettings],
  migrations: [],
  subscribers: [],
});
