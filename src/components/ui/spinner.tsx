import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'amber' | 'white' | 'muted';
}

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
};

const variantClasses = {
  primary: 'text-primary',
  amber: 'text-amber-500',
  white: 'text-white',
  muted: 'text-slate-400 dark:text-slate-600',
};

export function Spinner({ size = 'md', variant = 'amber', className, ...props }: SpinnerProps) {
  return (
    <div role="status" className={cn('inline-flex items-center justify-center', className)} {...props}>
      <Loader2 className={cn('animate-spin', sizeClasses[size], variantClasses[variant])} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
