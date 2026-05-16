import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: 'My247Shop',
    short_name: 'My247',
    description: 'My247Shop E-commerce Application',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/pwa-icons/android/launchericon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-icons/android/launchericon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/pwa-icons/ios/180.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
