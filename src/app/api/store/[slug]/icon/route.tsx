import { ImageResponse } from 'next/og';
import { StorefrontService } from '@/app/store/[slug]/storefrontService';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const size = parseInt(searchParams.get('size') || '512', 10);
    
    const slug = (await params).slug;
    const storeData = await StorefrontService.getStoreDetails(slug);
    const storeName = storeData?.name || 'Store';
    const firstLetter = storeName.charAt(0).toUpperCase();

    // Adjust font size and padding based on dimensions
    const fontSize = Math.floor(size * 0.55);
    const borderRadius = '15%';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black',
            borderRadius: borderRadius,
            fontSize: fontSize,
            fontWeight: 900,
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase',
          }}
        >
          {firstLetter}
        </div>
      ),
      {
        width: size,
        height: size,
      }
    );
  } catch (e) {
    return new Response(`Failed to generate icon`, { status: 500 });
  }
}
