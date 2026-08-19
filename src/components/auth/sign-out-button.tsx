'use client';

import * as React from 'react';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';

interface SignOutButtonProps extends ButtonProps {
  callbackUrl?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function SignOutButton({
  callbackUrl = '/login',
  showIcon = true,
  children,
  className,
  variant = 'ghost',
  ...props
}: SignOutButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl });
  };

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      disabled={loading}
      className={className}
      {...props}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children || 'Sign Out'}
    </Button>
  );
}
