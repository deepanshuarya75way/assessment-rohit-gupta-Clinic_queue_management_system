import 'reflect-metadata';
import http from 'http';
import { AppDataSource } from './config/database';
import { env } from './config/env';
import app from './app';
import { initSocket } from './socket';
import bcrypt from 'bcryptjs';
import { User } from './entities/User';
import { Doctor } from './entities/Doctor';

async function seedDefaults(): Promise<void> {
  const userRepo = AppDataSource.getRepository(User);
  const doctorRepo = AppDataSource.getRepository(Doctor);

  const userCount = await userRepo.count();

  if (userCount === 0) {
    const adminHash = await bcrypt.hash('admin123', 10);
    const doctorHash = await bcrypt.hash('doctor123', 10);
    const receptionHash = await bcrypt.hash('reception123', 10);

    let seedDoctorId: number | null = null;

    const doctorCount = await doctorRepo.count();
    if (doctorCount === 0) {
      const dr = doctorRepo.create({
        fullName: 'Smith',
        specialization: 'General Medicine',
        avgConsultationMinutes: 10,
      });
      const saved = await doctorRepo.save(dr);
      seedDoctorId = saved.id;
      console.log('[Seed] Default doctor created');
    } else {
      const existing = await doctorRepo.findOne({ order: { id: 'ASC' } });
      seedDoctorId = existing?.id || null;
    }

    await userRepo.save([
      userRepo.create({ username: 'admin', passwordHash: adminHash, name: 'Admin User', role: 'admin' as const }),
      userRepo.create({ username: 'doctor', passwordHash: doctorHash, name: 'Dr. Smith', role: 'doctor' as const, doctorId: seedDoctorId ?? undefined }),
      userRepo.create({ username: 'reception', passwordHash: receptionHash, name: 'Receptionist', role: 'receptionist' as const }),
    ]);
    console.log('[Seed] Default users created (admin/admin123, doctor/doctor123, reception/reception123)');
  }
}

async function main(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('[DB] Connected to PostgreSQL');

    await seedDefaults();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log(`[Server] Running on port ${env.PORT}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

main();
