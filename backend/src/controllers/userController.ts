import { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(2).max(30).regex(/^[a-z0-9_-]+$/i).optional(),
  bio: z.string().max(500).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  profile_image: z.string().url().nullable().optional(),
  theme_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  dark_mode: z.boolean().optional(),
});

export async function getProfile(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.toJSON());
}

export async function updateProfile(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
  }
  const data = parsed.data as Record<string, unknown>;
  if (data.username) {
    const existing = await User.findOne({
      username: (data.username as string).toLowerCase(),
      _id: { $ne: req.userId },
    });
    if (existing) return res.status(409).json({ error: 'Username already taken' });
    data.username = (data.username as string).toLowerCase();
  }
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: data },
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.toJSON());
}
