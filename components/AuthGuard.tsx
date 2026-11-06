'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (response.ok && data.success && data.user) {
          if (data.user.status === 'suspended') {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            return;
          }
          setLoading(false);
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return null; // or a spinner
  }

  return <>{children}</>;
};

export default AuthGuard;
