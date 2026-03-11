'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCardUrl } from '@/lib/utils';

// Generate QR in the browser so it always shows (no dependency on API)
async function generateQRDataUrl(url: string, size = 300): Promise<string> {
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

export default function DashboardQRPage() {
  const { user } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const cardUrl = user ? getCardUrl(user.username) : '';

  useEffect(() => {
    if (!user?.username || !cardUrl) return;
    generateQRDataUrl(cardUrl)
      .then(setQrDataUrl)
      .catch(() => setError(true));
  }, [user?.username, cardUrl]);

  function handleDownload() {
    if (!qrDataUrl || !user) return;
    downloadDataUrlAsPng(qrDataUrl, `card-${user.username}-qr.png`);
  }

  if (!user) return null;

  return (
    <div className="max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Code</CardTitle>
          <CardDescription>
            Share your card with a QR code. Anyone can scan it to open your card. For NFC, write this URL to a tag: {cardUrl}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {error ? (
            <p className="text-destructive text-sm">Could not generate QR code. Try again.</p>
          ) : qrDataUrl ? (
            <>
              <img src={qrDataUrl} alt="QR Code" className="rounded-lg border bg-white p-2" width={256} height={256} />
              <Button onClick={handleDownload}>Download QR code</Button>
            </>
          ) : (
            <p className="text-muted-foreground">Generating QR code...</p>
          )}
          <p className="text-center text-sm text-muted-foreground break-all">{cardUrl}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Write NFC Tag</CardTitle>
          <CardDescription>
            On Android with Chrome, you can write the card URL to an NFC tag. When someone taps the tag, they&apos;ll open your card. (Web NFC API is not available on all devices.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            URL to write: <code className="rounded bg-muted px-1">{cardUrl}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
