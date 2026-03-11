'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { qr as qrApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCardUrl } from '@/lib/utils';

export default function DashboardQRPage() {
  const { user } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [cardUrl, setCardUrl] = useState('');

  useEffect(() => {
    qrApi
      .get()
      .then(({ qrDataUrl: data, url }) => {
        setQrDataUrl(data);
        setCardUrl(url);
      })
      .catch(() => {});
  }, []);

  function handleDownload() {
    if (!qrDataUrl) return;
    // Convert data URL to Blob so the downloaded file is a real PNG (opens in Preview)
    fetch(qrDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `card-${user?.username ?? 'card'}-qr.png`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        // Fallback: download as data URL (may not open in some viewers)
        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = `card-${user?.username ?? 'card'}-qr.png`;
        a.click();
      });
  }

  if (!user) return null;

  return (
    <div className="max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Code</CardTitle>
          <CardDescription>
            Share your card with a QR code. Anyone can scan it to open your card. For NFC, write this URL to a tag: {getCardUrl(user.username)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {qrDataUrl ? (
            <>
              <img src={qrDataUrl} alt="QR Code" className="rounded-lg border bg-white p-2" width={256} height={256} />
              <Button onClick={handleDownload}>Download QR code</Button>
            </>
          ) : (
            <p className="text-muted-foreground">Loading QR code...</p>
          )}
          <p className="text-center text-sm text-muted-foreground break-all">{cardUrl || getCardUrl(user.username)}</p>
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
            URL to write: <code className="rounded bg-muted px-1">{getCardUrl(user.username)}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
