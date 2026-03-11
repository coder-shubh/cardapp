import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { generateQRCode } from '../services/qrService.js';
import { User } from '../models/User.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = await User.findById(req.userId).select('username');
  if (!user) return res.status(404).json({ error: 'User not found' });
  const baseUrl = process.env.CARD_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const cardUrl = `${baseUrl.replace(/\/$/, '')}/card/${user.username}`;
  const dataUrl = await generateQRCode(cardUrl, { size: 300 });
  res.json({ url: cardUrl, qrDataUrl: dataUrl });
});

export default router;
