'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analytics as analyticsApi } from '@/lib/api';

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalQR: number;
  totalNFC: number;
  clicksPerLink: { linkId: string; title: string; clicks: number }[];
  dailyViews: { date: string; count: number }[];
}

export default function DashboardAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .get()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  if (loading) {
    return <p className="text-muted-foreground">Loading analytics...</p>;
  }

  if (!data) {
    return <p className="text-muted-foreground">Failed to load analytics.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <p className="text-muted-foreground">Profile views, link clicks, QR scans, and NFC taps.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total views</p>
          <p className="text-2xl font-bold">{data.totalViews}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Link clicks</p>
          <p className="text-2xl font-bold">{data.totalClicks}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">QR scans</p>
          <p className="text-2xl font-bold">{data.totalQR}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">NFC taps</p>
          <p className="text-2xl font-bold">{data.totalNFC}</p>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Clicks per link</h3>
        {data.clicksPerLink.length === 0 ? (
          <p className="text-sm text-muted-foreground">No link clicks yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.clicksPerLink.map((item) => (
              <li key={item.linkId} className="flex justify-between">
                <span>{item.title}</span>
                <span className="font-medium">{item.clicks}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Daily views (last 30 days)</h3>
        {data.dailyViews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No daily data yet.</p>
        ) : (
          <div className="space-y-1">
            {data.dailyViews.slice(0, 14).map((d) => (
              <div key={d.date} className="flex justify-between text-sm">
                <span>{d.date}</span>
                <span>{d.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
