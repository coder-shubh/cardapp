'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { card as cardApi, type CardUser } from '@/lib/api';
import { Card as CardUi } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Mail,
  MessageCircle,
  Linkedin,
  Github,
  Instagram,
  Globe,
  Share2,
  Copy,
  QrCode,
} from 'lucide-react';
import { getCardUrl, cn } from '@/lib/utils';

async function generateQRDataUrl(url: string, size = 256): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(url, { width: size, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
}

function downloadDataUrlAsPng(dataUrl: string, filename: string) {
  fetch(dataUrl)
    .then((res) => res.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(() => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.click();
    });
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  twitter: Globe,
  portfolio: Globe,
  whatsapp: MessageCircle,
  custom: Globe,
  youtube: Globe,
  facebook: Globe,
};

export default function CardPage() {
  const params = useParams();
  const username = params.username as string;
  const [data, setData] = useState<CardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const cardUrl = typeof window !== 'undefined' ? getCardUrl(username) : '';

  useEffect(() => {
    if (!username) return;
    cardApi
      .get(username)
      .then((user) => {
        setData(user);
        cardApi.recordView(username).catch(() => {});
      })
      .catch(() => setError('Card not found'))
      .finally(() => setLoading(false));
  }, [username]);

  // Generate QR when card URL is ready (for share section download)
  useEffect(() => {
    if (!cardUrl) return;
    generateQRDataUrl(cardUrl).then(setQrDataUrl).catch(() => {});
  }, [cardUrl]);

  const themeColor = data?.theme_color ?? '#6366f1';
  const isDark = data?.dark_mode ?? false;

  function handleCopyLink() {
    if (!cardUrl) return;
    navigator.clipboard.writeText(cardUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my card: ${cardUrl}`)}`, '_blank');
  }

  function handleShareEmail() {
    window.location.href = `mailto:?subject=My digital card&body=${encodeURIComponent(`Check out my card: ${cardUrl}`)}`;
  }

  function handleLinkClick(linkId: string) {
    cardApi.recordLinkClick(username, linkId).catch(() => {});
  }

  function handleDownloadQR() {
    if (!qrDataUrl || !data) return;
    downloadDataUrlAsPng(qrDataUrl, `${data.username}-qr.png`);
  }

  const vcardDownloadUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/card/${username}/vcard` : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <p className="text-destructive">{error || 'Card not found'}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen py-8 px-4',
        isDark ? 'bg-neutral-900 text-neutral-100' : 'bg-gradient-to-b from-muted/50 to-background'
      )}
    >
      <div className="mx-auto max-w-sm">
        <CardUi
          className={cn(
            'overflow-hidden shadow-xl',
            isDark ? 'border-neutral-700 bg-neutral-800' : 'bg-card'
          )}
        >
          <div className="p-6 pb-4">
            <div className="flex flex-col items-center text-center">
              <Avatar
                className="h-24 w-24 border-4 shadow-lg"
                style={{ borderColor: themeColor }}
              >
                <AvatarImage src={data.profile_image ?? undefined} alt={data.name} />
                <AvatarFallback
                  className="text-2xl text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  {data.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="mt-4 text-2xl font-bold">{data.name}</h1>
              {data.bio && (
                <p className={cn('mt-2 text-sm', isDark ? 'text-neutral-400' : 'text-muted-foreground')}>
                  {data.bio}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2 px-4 pb-4">
            {data.phone && (
              <a
                href={`tel:${data.phone.replace(/\s/g, '')}`}
                className="flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: themeColor }}
              >
                <Phone className="h-5 w-5" />
                Call
              </a>
            )}
            {data.email && (
              <a
                href={`mailto:${data.email}`}
                className="flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: themeColor }}
              >
                <Mail className="h-5 w-5" />
                Email
              </a>
            )}
            {data.phone && (
              <a
                href={`https://wa.me/${data.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
            )}
            {data.links.map((link) => {
              const Icon = PLATFORM_ICONS[link.platform] ?? Globe;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link.id)}
                  className="flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: themeColor }}
                >
                  <Icon className="h-5 w-5" />
                  {link.title}
                </a>
              );
            })}
          </div>
        </CardUi>

        <div className="mt-6 flex flex-col gap-2">
          <a
            href={vcardDownloadUrl}
            download={`contact-${data.username}.vcf`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition hover:bg-muted"
            style={{ borderColor: themeColor, color: themeColor }}
          >
            Save Contact
          </a>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowShare((s) => !s)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          {showShare && (
            <div className="flex flex-wrap justify-center gap-2 rounded-lg border bg-card p-3">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                {copied ? 'Copied!' : 'Copy link'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareEmail}>
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadQR}
                disabled={!qrDataUrl}
                className="inline-flex items-center gap-1"
              >
                <QrCode className="h-4 w-4" />
                {qrDataUrl ? 'Download QR' : 'QR…'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
