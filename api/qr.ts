import QRCode from 'qrcode';

/**
 * Generates a QR Code as a PNG image Buffer.
 */
export async function generateQrBuffer(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    margin: 1,
    width: 250,
    color: {
      dark: '#050f22', // Deep navy
      light: '#ffffff', // White
    },
  });
}

/**
 * Generates a QR Code as a Base64 Data URL (e.g. for frontend use).
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 250,
    color: {
      dark: '#050f22',
      light: '#ffffff',
    },
  });
}
