import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { env } from '../config/env';
import { User } from '../entities/User';
import { AuthRequest } from '../types';

const userRepo = () => AppDataSource.getRepository(User);

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const user = await userRepo().findOneBy({ username });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: 'Account deactivated' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, role: user.role, doctorId: user.doctorId },
  });
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  const { username, password, name, role, doctorId } = req.body;
  if (!username || !password || !name || !role) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const existing = await userRepo().findOneBy({ username });
  if (existing) {
    res.status(409).json({ error: 'Username already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = userRepo().create({ username, passwordHash, name, role, doctorId });
  await userRepo().save(user);

  res.status(201).json({ message: 'User created', id: user.id });
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  const user = await userRepo().findOneBy({ id: req.user!.userId });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ id: user.id, name: user.name, role: user.role, doctorId: user.doctorId });
}
