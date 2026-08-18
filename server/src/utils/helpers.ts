import { ClinicSettings } from '../entities/ClinicSettings';

export function generateTokenNumber(
  doctorId: number,
  sequenceNumber: number
): string {
  return `D${doctorId}-${String(sequenceNumber).padStart(3, '0')}`;
}

export async function getNextSequence(
  settingsRepo: any,
  today: string
): Promise<number> {
  let settings = await settingsRepo.findOne({ where: { id: 1 } });
  if (!settings) {
    settings = settingsRepo.create({ id: 1, clinicName: 'Clinic' });
  }

  if (settings.tokenCounterDate !== today) {
    settings.tokenCounter = 0;
    settings.tokenCounterDate = today;
  }

  settings.tokenCounter += 1;
  await settingsRepo.save(settings);
  return settings.tokenCounter;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}
