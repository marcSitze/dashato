import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Strict Server-Side Role Protection
  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const userPayload = {
    name: user.name,
    email: user.email,
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100">
      {/* Sidebar Navigation (Desktop) */}
      <AdminSidebar user={userPayload} />

      {/* Main Admin Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar Header */}
        <AdminHeader user={userPayload} />

        {/* Dynamic Admin Page Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
