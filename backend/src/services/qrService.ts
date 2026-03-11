import QRCode from 'qrcode';

export async function generateQRCode(url: string, options?: { size?: number }): Promise<string> {
  const size = options?.size ?? 256;
  return QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
}
