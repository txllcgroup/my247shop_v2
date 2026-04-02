import { NextResponse } from 'next/server';
import { StorefrontService } from '@/app/store/[slug]/storefrontService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const storeData = await StorefrontService.getStoreDetails(slug);
    
    if (!storeData) {
      return new Response('Store not found', { status: 404 });
    }

    const { name, logoUrl } = storeData;
    const iconUrl = logoUrl || `/api/store/${slug}/icon`;

    const manifest = {
      name: name || 'My247Shop',
      short_name: name || 'My247',
      description: `${name || 'My247Shop'} E-commerce Application`,
      start_url: `/store/${slug}`,
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      icons: [
        {
          src: iconUrl.includes('?') ? iconUrl : `${iconUrl}?size=512`,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: `/api/store/${slug}/icon?size=192`,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: `/api/store/${slug}/icon?size=180`,
          sizes: '180x180',
          type: 'image/png',
          purpose: 'any maskable',
        }
      ],
    };

    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
      },
    });
  } catch (error) {
    console.error('Manifest generation error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
