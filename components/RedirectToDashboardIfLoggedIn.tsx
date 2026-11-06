'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const RedirectToDashboardIfLoggedIn = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (response.ok && data.success && data.user) {
          if (data.user.status === 'suspended') {
            await fetch('/api/auth/logout', { method: 'POST' });
            setIsRedirecting(false);
            return;
          }
          router.replace('/dashboard');
        } else {
          setIsRedirecting(false);
        }
      } catch (error) {
        setIsRedirecting(false);
      }
    };

    checkAuth();
  }, [router]);

  if (!isRedirecting) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-gray-700">Loading...</p>
      </div>
    </div>
  );
};

export default RedirectToDashboardIfLoggedIn;
