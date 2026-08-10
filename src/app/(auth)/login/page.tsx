'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { Lock, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('admin@dashato.com');
  const [password, setPassword] = React.useState('password123');
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
        toast.error(res.error || 'Invalid credentials');
      } else {
        toast.success('Signed in successfully!');
        if (email.includes('admin')) {
          router.push('/admin');
        } else if (email.includes('vendor')) {
          router.push('/vendor');
        } else {
          router.push('/account');
        }
      }
    } catch (err: any) {
      toast.error('Authentication error');
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
            <div className="bg-amber-500 text-slate-950 font-black text-2xl px-4 py-1.5 rounded-2xl w-fit mx-auto shadow-md">
              Dashato
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-slate-500">Access buyer orders, vendor dashboard, or admin controls</p>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
            <span className="font-bold text-amber-600 dark:text-amber-400 block">Quick Demo Accounts (Password: password123)</span>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <button onClick={() => { setEmail('admin@dashato.com'); setPassword('password123'); }} className="bg-slate-900 text-white px-2 py-0.5 rounded font-mono">
                👑 Admin
              </button>
              <button onClick={() => { setEmail('vendor@techpro.com'); setPassword('password123'); }} className="bg-slate-900 text-white px-2 py-0.5 rounded font-mono">
                🏪 Vendor
              </button>
              <button onClick={() => { setEmail('sarah@example.com'); setPassword('password123'); }} className="bg-slate-900 text-white px-2 py-0.5 rounded font-mono">
                🛒 Customer
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl font-mono"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Don't have an account? <Link href="/register" className="text-amber-600 font-bold hover:underline">Create Account</Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
