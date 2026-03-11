import { Request, Response } from 'express';
import { User } from '../models/User.js';

function escapeVCard(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export async function getVCard(req: Request, res: Response) {
  const { username } = req.params;
  const user = await User.findOne({ username: username.toLowerCase() }).select('name phone email username');
  if (!user) return res.status(404).json({ error: 'Card not found' });

  const baseUrl = process.env.CARD_BASE_URL || 'https://cardapp.com';
  const url = `${baseUrl}/card/${user.username}`;

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(user.name)}`,
  ];
  if (user.phone) lines.push(`TEL:${user.phone.replace(/\s/g, '')}`);
  if (user.email) lines.push(`EMAIL:${user.email}`);
  lines.push(`URL:${url}`);
  lines.push('END:VCARD');

  const vcard = lines.join('\r\n');
  const filename = `contact-${user.username}.vcf`;
  res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(vcard);
}
