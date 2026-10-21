'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { Store, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function VendorApplicationPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    businessName: '',
    storeName: '',
    supportEmail: '',
    supportPhone: '',
    taxId: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la soumission de la candidature');
      }

      toast.success(
        t.vendorApplicationSuccessToast ||
          'Candidature vendeur soumise avec succès ! Notre équipe étudiera votre dossier sous 24h.'
      );
      router.push('/vendor');
    } catch (err: any) {
      toast.error(err.message || 'Impossible de soumettre la candidature');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <Card className="rounded-3xl p-8 sm:p-12 border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Store className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t.applyToSellTitle || 'Devenir Vendeur sur Dashato'}
            </h1>
            <p className="text-sm text-slate-500">
              {t.applyToSellSubtitle ||
                'Rejoignez les meilleurs commerçants vérifiés et vendez à des millions d’acheteurs.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.legalBusinessName || 'Raison Sociale de l’Entreprise'}
                </label>
                <Input
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="ex: Acme Electronics SARL"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.desiredStoreName || 'Nom Souhaité pour la Boutique'}
                </label>
                <Input
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  placeholder="ex: Acme Store Direct"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.supportEmail || 'Email du Support'}
                </label>
                <Input
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  placeholder="contact@boutique.com"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.supportPhone || 'Téléphone du Support'}
                </label>
                <Input
                  type="tel"
                  value={form.supportPhone}
                  onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.taxIdEin || 'Numéro Fiscal / SIRET / TVA'}
                </label>
                <Input
                  value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                  placeholder="ex: FR12345678901"
                  className="rounded-xl font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.storeDescription || 'Description de la Boutique'}
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez les types de produits et marques que vous distribuez..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.submittingApplication || 'Envoi en cours...'}
                </span>
              ) : (
                t.submitVendorApplication || 'Soumettre ma Candidature Vendeur'
              )}
            </Button>
          </form>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

