import { AuthGuard } from '@/components/AuthGuard';

export const metadata = {
  title: 'POS Terminal | My247Shop',
};

export default function POSStandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="fixed inset-0 overflow-hidden bg-gray-50 font-sans selection:bg-black selection:text-white">
        {children}
      </div>
    </AuthGuard>
  );
}
