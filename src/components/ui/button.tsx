import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Helper utility if not created yet
export function cn_util(...inputs: any[]) {
  return cn(...inputs);
}

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground font-semibold hover:bg-primary-hover shadow-sm',
        destructive: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm',
        outline: 'border border-border bg-transparent hover:bg-muted text-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-sm',
        tertiary: 'bg-tertiary text-tertiary-foreground hover:bg-tertiary-hover shadow-sm',
        ghost: 'hover:bg-muted text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        amberOutline: 'border-2 border-primary text-primary hover:bg-primary/10',
        primaryOutline: 'border-2 border-primary text-primary hover:bg-primary/10',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base font-semibold',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
