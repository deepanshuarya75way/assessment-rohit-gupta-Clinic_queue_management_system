import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import jwt from 'jsonwebtoken';

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      (socket as any).user = null;
      (socket as any).role = 'public';
      return next();
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      (socket as any).user = decoded;
      next();
    } catch {
      (socket as any).user = null;
      (socket as any).role = 'public';
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user as JwtPayload | null;
    const role = (socket as any).role || 'public';

    if (user) {
      console.log(`[Socket] ${role} connected (${user.userId})`);
      if (role === 'doctor' && (user as any).doctorId) {
        socket.join(`doctor:${(user as any).doctorId}`);
      }
      if (role === 'admin' || role === 'receptionist') {
        socket.join('staff');
      }
    } else {
      console.log(`[Socket] Public client connected`);
    }

    socket.join('display');

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function emitQueueUpdate(doctorId: number): void {
  if (!io) return;
  io.to(`doctor:${doctorId}`).emit('queue:updated', { doctorId });
  io.to('staff').emit('queue:updated', { doctorId });
  io.to('display').emit('queue:updated', { doctorId });
}
