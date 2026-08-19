'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Admin Error Boundary caught error:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <div className="space-y-1 max-w-md">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Admin Section Error</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          An unexpected error occurred while loading this administrative view. Please try reloading.
        </p>
      </div>
      <Button
        onClick={() => reset()}
        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-5 shadow-sm"
      >
        <RefreshCw className="w-4 h-4 mr-2" /> Reload Admin View
      </Button>
    </div>
  );
}
