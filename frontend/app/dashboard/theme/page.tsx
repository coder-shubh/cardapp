'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { user as userApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CardPreview } from '@/components/dashboard/CardPreview';
import { links as linksApi } from '@/lib/api';

const THEME_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#3b82f6',
];

export default function DashboardThemePage() {
  const { user, setUser } = useAuth();
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [darkMode, setDarkMode] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [links, setLinks] = useState<{ id: string; platform: string; title: string; url: string }[]>([]);

  useEffect(() => {
    if (user) {
      setThemeColor(user.theme_color || '#6366f1');
      setDarkMode(user.dark_mode ?? false);
      setProfileImageUrl(user.profile_image ?? '');
      linksApi.list().then(setLinks).catch(() => {});
    }
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await userApi.updateProfile({
        theme_color: themeColor,
        dark_mode: darkMode,
        profile_image: profileImageUrl.trim() || null,
      });
      setUser(updated);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const previewUser = {
    ...user,
    theme_color: themeColor,
    dark_mode: darkMode,
    profile_image: profileImageUrl.trim() || user.profile_image,
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Customize your card appearance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Accent color</Label>
              <div className="flex flex-wrap gap-2">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-9 w-9 rounded-full border-2 transition hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: themeColor === color ? '#000' : 'transparent',
                    }}
                    onClick={() => setThemeColor(color)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="h-10 w-14 p-1 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{themeColor}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark mode</Label>
                <p className="text-xs text-muted-foreground">Use dark theme on your card</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile image URL</Label>
              <Input
                id="profileImage"
                type="url"
                placeholder="https://..."
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Or use Cloudinary upload in production.</p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save theme'}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div>
        <CardPreview user={previewUser} links={links} />
      </div>
    </div>
  );
}
