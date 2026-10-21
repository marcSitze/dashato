import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { VendorSidebar } from '@/components/vendor/vendor-sidebar';
import { VendorHeader } from '@/components/vendor/vendor-header';

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Strict Role Protection for Vendor Portal
  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const vendorRecord = await db.vendor.findFirst({
    where: { userId: user.id },
    include: { store: true },
  });

  const userPayload = {
    name: user.name,
    email: user.email,
  };

  const storePayload = vendorRecord?.store
    ? {
        name: vendorRecord.store.name,
        logo: vendorRecord.store.logo || undefined,
        rating: vendorRecord.store.rating || 4.9,
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 w-full max-w-full overflow-x-hidden">
      {/* Sidebar Navigation (Desktop) */}
      <VendorSidebar user={userPayload} vendorStore={storePayload} />

      {/* Main Vendor Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        {/* Top Navbar Header */}
        <VendorHeader user={userPayload} />

        {/* Dynamic Vendor Route Content */}
        <main className="flex-1 overflow-y-auto smooth-scroll-y p-4 sm:p-6 lg:p-8 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
