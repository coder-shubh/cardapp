// Shared types for frontend and backend

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  phone: string | null;
  profile_image: string | null;
  theme_color: string;
  created_at: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface Link {
  id: string;
  user_id: string;
  platform: string;
  title: string;
  url: string;
  created_at: string;
}

export type AnalyticsType = 'view' | 'click' | 'qr' | 'nfc';

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  type: AnalyticsType;
  link_id: string | null;
  date: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

export const PLATFORMS = [
  'custom',
  'linkedin',
  'github',
  'instagram',
  'twitter',
  'portfolio',
  'whatsapp',
  'youtube',
  'facebook',
] as const;

export type Platform = (typeof PLATFORMS)[number];
