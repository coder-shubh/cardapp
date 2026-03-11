import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Link } from '../models/Link.js';

export async function getCardByUsername(req: Request, res: Response) {
  const { username } = req.params;
  const user = await User.findOne({ username: username.toLowerCase() }).select('-password');
  if (!user) return res.status(404).json({ error: 'Card not found' });
  const links = await Link.find({ user_id: user._id }).sort({ order: 1 }).select('id platform title url');
  const card = user.toJSON() as Record<string, unknown>;
  card.links = links.map((l) => ({
    id: l._id.toString(),
    platform: l.platform,
    title: l.title,
    url: l.url,
  }));
  res.json(card);
}
