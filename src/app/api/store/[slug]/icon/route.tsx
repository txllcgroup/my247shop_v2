import { ImageResponse } from 'next/og';
import { StorefrontService } from '@/app/store/[slug]/storefrontService';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = (await params).slug;
    const storeData = await StorefrontService.getStoreDetails(slug);
    const storeName = storeData?.name || 'Store';
    const firstLetter = storeName.charAt(0).toUpperCase();

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
            borderRadius: '15%',
            fontSize: 280,
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
        width: 512,
        height: 512,
      }
    );
  } catch (e) {
    return new Response(`Failed to generate icon`, { status: 500 });
  }
}
