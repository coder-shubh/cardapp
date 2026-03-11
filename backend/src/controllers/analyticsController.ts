import { Request, Response } from 'express';
import mongoose from 'mongoose';
import type { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Link } from '../models/Link.js';
import { AnalyticsEvent } from '../models/AnalyticsEvent.js';

export async function recordView(req: Request, res: Response) {
  const { username } = req.params;
  const user = await User.findOne({ username: username.toLowerCase() }).select('_id');
  if (!user) return res.status(404).json({ error: 'Card not found' });
  await AnalyticsEvent.create({ user_id: user._id, type: 'view' });
  res.status(204).send();
}

export async function recordLinkClick(req: Request, res: Response) {
  const { username } = req.params;
  const linkId = req.body?.linkId as string | undefined;
  const user = await User.findOne({ username: username.toLowerCase() }).select('_id');
  if (!user) return res.status(404).json({ error: 'Card not found' });
  await AnalyticsEvent.create({ user_id: user._id, type: 'click', link_id: linkId || null });
  res.status(204).send();
}

export async function recordQR(req: Request, res: Response) {
  const { username } = req.params;
  const user = await User.findOne({ username: username.toLowerCase() }).select('_id');
  if (!user) return res.status(404).json({ error: 'Card not found' });
  await AnalyticsEvent.create({ user_id: user._id, type: 'qr' });
  res.status(204).send();
}

export async function recordNFC(req: Request, res: Response) {
  const { username } = req.params;
  const user = await User.findOne({ username: username.toLowerCase() }).select('_id');
  if (!user) return res.status(404).json({ error: 'Card not found' });
  await AnalyticsEvent.create({ user_id: user._id, type: 'nfc' });
  res.status(204).send();
}

export async function getAnalytics(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

  const [totalViews, totalClicks, totalQR, totalNFC, clickEvents, viewEvents, linkCounts] = await Promise.all([
    AnalyticsEvent.countDocuments({ user_id: req.userId, type: 'view' }),
    AnalyticsEvent.countDocuments({ user_id: req.userId, type: 'click' }),
    AnalyticsEvent.countDocuments({ user_id: req.userId, type: 'qr' }),
    AnalyticsEvent.countDocuments({ user_id: req.userId, type: 'nfc' }),
    AnalyticsEvent.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(req.userId), type: 'click', link_id: { $ne: null } } },
      { $group: { _id: '$link_id', count: { $sum: 1 } } },
    ]),
    AnalyticsEvent.find({ user_id: req.userId, type: 'view' }).sort({ date: -1 }).limit(5000).select('date').lean(),
    Link.find({ user_id: req.userId }).select('_id title').lean(),
  ]);

  const dayCount = new Map<string, number>();
  for (const e of viewEvents) {
    const day = (e.date as Date).toISOString().slice(0, 10);
    dayCount.set(day, (dayCount.get(day) ?? 0) + 1);
  }
  const dailyViews = Array.from(dayCount.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  const clicksPerLink = linkCounts.map((link) => {
    const id = String(link._id);
    const agg = clickEvents.find((c) => String(c._id) === id);
    return { linkId: id, title: link.title, clicks: agg?.count ?? 0 };
  });

  res.json({
    totalViews,
    totalClicks,
    totalQR,
    totalNFC,
    clicksPerLink,
    dailyViews,
  });
}
