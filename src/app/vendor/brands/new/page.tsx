import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { BrandFormClient } from '@/app/admin/brands/brand-form-client';
import { ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';

export default async function VendorCreateBrandPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div>
        <Link
          href="/vendor/brands"
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour aux Marques
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Tag className="w-7 h-7 text-amber-500" />
          Créer une Marque Partenaire
        </h1>
        <p className="text-sm text-slate-500">
          Ajoutez un nouveau fabricant ou fournisseur officiel au catalogue marketplace
        </p>
      </div>

      <BrandFormClient redirectPath="/vendor/brands" />
    </div>
  );
}
