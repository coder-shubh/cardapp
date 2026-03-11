import { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import { Link } from '../models/Link.js';

const createLinkSchema = z.object({
  platform: z.string().max(50).default('custom'),
  title: z.string().min(1).max(100),
  url: z.string().url(),
  order: z.number().int().min(0).optional(),
});

const updateLinkSchema = z.object({
  platform: z.string().max(50).optional(),
  title: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  order: z.number().int().min(0).optional(),
});

export async function getLinks(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const links = await Link.find({ user_id: req.userId }).sort({ order: 1 });
  res.json(links.map((l) => l.toJSON()));
}

export async function createLink(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const parsed = createLinkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
  }
  const last = await Link.findOne({ user_id: req.userId }).sort({ order: -1 }).select('order');
  const order = parsed.data.order ?? (last ? last.order + 1 : 0);
  const link = await Link.create({
    user_id: req.userId,
    platform: parsed.data.platform,
    title: parsed.data.title,
    url: parsed.data.url,
    order,
  });
  res.status(201).json(link.toJSON());
}

export async function updateLink(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const { id } = req.params;
  const parsed = updateLinkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
  }
  const link = await Link.findOne({ _id: id, user_id: req.userId });
  if (!link) return res.status(404).json({ error: 'Link not found' });
  Object.assign(link, parsed.data);
  await link.save();
  res.json(link.toJSON());
}

export async function deleteLink(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const { id } = req.params;
  const link = await Link.findOne({ _id: id, user_id: req.userId });
  if (!link) return res.status(404).json({ error: 'Link not found' });
  await Link.deleteOne({ _id: id });
  res.status(204).send();
}

export async function reorderLinks(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const schema = z.object({ linkIds: z.array(z.string()) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid linkIds' });
  const { linkIds } = parsed.data;
  await Promise.all(
    linkIds.map((linkId, index) =>
      Link.updateOne({ _id: linkId, user_id: req.userId }, { $set: { order: index } })
    )
  );
  const links = await Link.find({ user_id: req.userId }).sort({ order: 1 });
  res.json(links.map((l) => l.toJSON()));
}
