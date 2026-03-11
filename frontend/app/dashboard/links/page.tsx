'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { links as linksApi, type Link } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardPreview } from '@/components/dashboard/CardPreview';

const PLATFORMS = [
  { value: 'custom', label: 'Custom' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
];

export default function DashboardLinksPage() {
  const { user } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPlatform, setNewPlatform] = useState('custom');

  useEffect(() => {
    linksApi.list().then(setLinks).finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    setAdding(true);
    try {
      const created = await linksApi.create({
        platform: newPlatform,
        title: newTitle.trim(),
        url: newUrl.trim(),
      });
      setLinks((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      setNewTitle('');
      setNewUrl('');
      setNewPlatform('custom');
    } catch {
      // show error
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await linksApi.delete(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch {
      // show error
    }
  }

  if (!user) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
            <CardDescription>Add and manage links on your card.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Platform / Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. LinkedIn"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={adding}>
                {adding ? 'Adding...' : 'Add link'}
              </Button>
            </form>
            <div className="border-t pt-4">
              <h4 className="mb-2 text-sm font-medium">Your links</h4>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : links.length === 0 ? (
                <p className="text-sm text-muted-foreground">No links yet. Add one above.</p>
              ) : (
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li
                      key={link.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div>
                        <span className="font-medium">{link.title}</span>
                        <span className="ml-2 text-xs text-muted-foreground truncate max-w-[200px] inline-block align-bottom">
                          {link.url}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(link.id)}
                      >
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <CardPreview user={user} links={links} />
      </div>
    </div>
  );
}
