'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du compte');

      toast.success(
        t.accountCreatedSuccessToast || 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.'
      );
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Erreur d’inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-md mx-auto px-4 py-16 w-full">
        <Card className="rounded-3xl p-8 border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center my-2">
              <img
                src="/Dashato_logo_light_mode.png"
                alt="Dashato"
                className="h-10 w-auto dark:hidden object-contain"
              />
              <img
                src="/Dashato_logo_dark_mode.png"
                alt="Dashato"
                className="h-10 w-auto hidden dark:block object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t.createAccountTitle || 'Créer un Compte'}
            </h1>
            <p className="text-xs text-slate-500">
              {t.createAccountSubtitle || 'Rejoignez Dashato pour découvrir nos produits d’exception et suivre vos commandes'}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.nameLabel || 'Nom Complet'}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Jean Dupont"
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.emailLabel || 'Adresse Email'}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean.dupont@exemple.com"
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.passwordLabel || 'Mot de Passe'}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Type de Compte
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="CUSTOMER">Client / Acheteur</option>
                <option value="VENDOR">Vendeur / Boutique Partenaire</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (t.creatingAccount || 'Création du compte...') : (t.register || 'Créer mon Compte')}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            {t.alreadyHaveAccount || 'Vous avez déjà un compte ?'}{' '}
            <Link href="/login" className="text-amber-600 font-bold hover:underline">
              {t.signIn || 'Se connecter'}
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
