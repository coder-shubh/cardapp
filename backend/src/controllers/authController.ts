import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import type { JwtPayload } from '../types.js';
import type { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  username: z.string().min(2).max(30).regex(/^[a-z0-9_-]+$/i, 'Username: letters, numbers, underscore, hyphen only'),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(payload: JwtPayload): string {
  const secret = env.JWT_SECRET || 'fallback-secret';
  return jwt.sign(payload, secret, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions);
}

function toUserResponse(doc: { id: string; name: string; username: string; email: string; bio?: string | null; phone?: string | null; profile_image?: string | null; theme_color?: string; dark_mode?: boolean; created_at?: Date }) {
  return {
    id: doc.id,
    name: doc.name,
    username: doc.username,
    email: doc.email,
    bio: doc.bio ?? null,
    phone: doc.phone ?? null,
    profile_image: doc.profile_image ?? null,
    theme_color: doc.theme_color ?? '#6366f1',
    dark_mode: doc.dark_mode ?? false,
    created_at: (doc as { created_at?: Date }).created_at,
  };
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
  }
  const { name, username, email, password } = parsed.data;

  const existing = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });
  if (existing) {
    return res.status(409).json({ error: existing.email === email ? 'Email already registered' : 'Username taken' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email,
    password: hashed,
    theme_color: '#6366f1',
  });

  const token = signToken({ userId: String(user._id), email: user.email, username: user.username });
  res.status(201).json({
    token,
    user: toUserResponse({ ...user.toJSON(), id: String(user._id) }),
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({ userId: String(user._id), email: user.email, username: user.username });
  res.json({
    token,
    user: toUserResponse({ ...user.toJSON(), id: String(user._id) }),
  });
}

export async function logout(_req: AuthRequest, res: Response) {
  res.json({ message: 'Logged out' });
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.toJSON());
}
