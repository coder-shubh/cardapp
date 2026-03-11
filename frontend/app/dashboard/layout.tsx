'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const nav = [
  { href: '/dashboard', label: 'Profile' },
  { href: '/dashboard/links', label: 'Links' },
  { href: '/dashboard/theme', label: 'Theme' },
  { href: '/dashboard/qr', label: 'QR Code' },
  { href: '/dashboard/analytics', label: 'Analytics' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="font-semibold">
            CardApp
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/card/${user.username}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
              View card
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                router.push('/');
              }}
            >
              Log out
            </Button>
          </div>
        </div>
        <nav className="container mx-auto flex gap-1 px-4 pb-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${pathname === item.href ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
