'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function SignOutButton({ onClose }: { onClose?: () => void }) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear local storage if used
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      router.push('/login');
    } catch (e) {
      console.error('Logout failed:', e);
    }

    onClose?.();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span className="font-medium">Signout</span>
    </button>
  );
}
