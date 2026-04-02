import { Metadata } from 'next';
import StoreLayoutClient from './StoreLayoutClient';
import { StorefrontService } from './storefrontService';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const storeData = await StorefrontService.getStoreDetails(slug);
    const storeName = storeData?.name || 'Store';

    return {
      title: storeName,
      description: `Welcome to ${storeName} - Powered by My247Shop`,
      manifest: `/api/manifest/${slug}`,
      appleWebApp: {
        capable: true,
        title: storeName,
        statusBarStyle: 'black-translucent',
      },
      icons: {
        apple: storeData?.logoUrl || `/api/store/${slug}/icon`,
      }
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: 'Store',
      manifest: `/api/manifest/${slug}`,
    };
  }
}

export default async function StoreLayout({ 
  children,
  params 
}: { 
  children: React.ReactNode,
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  return (
    <StoreLayoutClient slug={slug}>
      {children}
    </StoreLayoutClient>
  );
}
