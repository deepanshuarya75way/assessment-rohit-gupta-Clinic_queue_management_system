import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AuthRequest } from '../types';

const repo = () => AppDataSource.getRepository(User);

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const users = await repo().find({
    select: ['id', 'name', 'username', 'role', 'doctorId', 'isActive', 'createdAt'],
    order: { name: 'ASC' },
  });
  res.json(users);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { username, password, name, role, doctorId } = req.body;
  if (!username || !password || !name || !role) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const existing = await repo().findOneBy({ username });
  if (existing) {
    res.status(409).json({ error: 'Username already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = repo().create({ username, passwordHash, name, role, doctorId });
  await repo().save(user);
  res.status(201).json({ id: user.id, name: user.name, username: user.username, role: user.role });
}

export async function toggleActive(req: AuthRequest, res: Response): Promise<void> {
  const user = await repo().findOneBy({ id: parseInt(req.params.id) });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  user.isActive = !user.isActive;
  await repo().save(user);
  res.json({ id: user.id, isActive: user.isActive });
}
