'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n/context';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || 'Identifiants invalides');
      } else {
        toast.success(t.signedInSuccessToast || 'Connexion réussie !');
        if (email.includes('admin')) {
          router.push('/admin');
        } else if (email.includes('vendor')) {
          router.push('/vendor');
        } else {
          router.push('/account');
        }
      }
    } catch (err: any) {
      toast.error('Erreur d’authentification');
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
              {t.signInTitle || 'Connexion à Votre Compte'}
            </h1>
            <p className="text-xs text-slate-500">
              {t.signInSubtitle || 'Accédez à vos commandes, à votre espace vendeur ou aux outils d’administration'}
            </p>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
            <span className="font-bold text-amber-600 dark:text-amber-400 block">
              {t.quickDemoNotice || 'Comptes de démonstration (Mot de passe : password123)'}
            </span>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => { setEmail('admin@dashato.com'); setPassword('password123'); }}
                className="bg-slate-900 text-white px-2 py-0.5 rounded font-mono hover:bg-slate-800 transition-colors"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail('vendor@techpro.com'); setPassword('password123'); }}
                className="bg-slate-900 text-white px-2 py-0.5 rounded font-mono hover:bg-slate-800 transition-colors"
              >
                🏪 Vendeur
              </button>
              <button
                type="button"
                onClick={() => { setEmail('sarah@example.com'); setPassword('password123'); }}
                className="bg-slate-900 text-white px-2 py-0.5 rounded font-mono hover:bg-slate-800 transition-colors"
              >
                🛒 Client
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.emailLabel || 'Adresse Email'}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (t.signingIn || 'Connexion en cours...') : (t.signIn || 'Se connecter')}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            {t.dontHaveAccount || "Vous n'avez pas de compte ?"}{' '}
            <Link href="/register" className="text-amber-600 font-bold hover:underline">
              {t.register || 'Créer un Compte'}
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

