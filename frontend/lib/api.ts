const API_BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getToken(), ...init } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const auth = {
  register: (data: { name: string; username: string; email: string; password: string }) =>
    api<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => api<{ message: string }>('/auth/logout', { method: 'POST' }),
  me: () => api<User>('/auth/me'),
};

// User
export const user = {
  getProfile: () => api<User>('/user/profile'),
  updateProfile: (data: Partial<UpdateProfilePayload>) =>
    api<User>('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// Links
export const links = {
  list: () => api<Link[]>('/links'),
  create: (data: { platform?: string; title: string; url: string; order?: number }) =>
    api<Link>('/links', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { platform?: string; title?: string; url?: string; order?: number }) =>
    api<Link>(`/links/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => api<void>(`/links/${id}`, { method: 'DELETE' }),
  reorder: (linkIds: string[]) =>
    api<Link[]>('/links/reorder', { method: 'POST', body: JSON.stringify({ linkIds }) }),
};

// Card (public)
export const card = {
  get: (username: string) => api<CardUser>(`/card/${username}`),
  getVCardUrl: (username: string) => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/api/card/${username}/vcard`;
  },
  recordView: (username: string) =>
    fetch(`/api/card/${username}/view`, { method: 'POST' }),
  recordLinkClick: (username: string, linkId?: string) =>
    fetch(`/api/card/${username}/link-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId }),
    }),
  recordQR: (username: string) =>
    fetch(`/api/card/${username}/qr`, { method: 'POST' }),
  recordNFC: (username: string) =>
    fetch(`/api/card/${username}/nfc`, { method: 'POST' }),
};

// Analytics
export const analytics = {
  get: () =>
    api<{
      totalViews: number;
      totalClicks: number;
      totalQR: number;
      totalNFC: number;
      clicksPerLink: { linkId: string; title: string; clicks: number }[];
      dailyViews: { date: string; count: number }[];
    }>('/analytics'),
};

// QR
export const qr = {
  get: () => api<{ url: string; qrDataUrl: string }>('/qr'),
};

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  phone: string | null;
  profile_image: string | null;
  theme_color: string;
  dark_mode: boolean;
  created_at: string;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  bio?: string | null;
  phone?: string | null;
  profile_image?: string | null;
  theme_color?: string;
  dark_mode?: boolean;
}

export interface Link {
  id: string;
  user_id: string;
  platform: string;
  title: string;
  url: string;
  order: number;
  created_at: string;
}

export interface CardUser extends User {
  links: { id: string; platform: string; title: string; url: string }[];
}
