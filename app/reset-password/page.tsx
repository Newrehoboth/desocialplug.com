'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
  });

  useEffect(() => {
    if (!token) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Invalid Link',
        message: 'This password reset link is invalid or has expired.',
      });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields',
      });
      return;
    }

    if (password.length < 6) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Password must be at least 6 characters',
      });
      return;
    }

    if (password !== confirmPassword) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Passwords do not match',
      });
      return;
    }

    if (!token) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setModal({
        isOpen: true,
        type: 'success',
        title: 'Password Reset Successful',
        message:
          'Your password has been successfully reset. You can now login with your new password.',
      });
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Reset Failed',
        message: err.message || 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSuccessClose = () => {
    closeModal();
    router.push('/login');
  };

  if (!token) return null; 

  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:mb-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
              Set New Password
            </h1>
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-12 pr-12 h-14 bg-gray-50 border border-gray-200 focus:border-primary rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="pl-12 pr-12 h-14 bg-gray-50 border border-gray-200 focus:border-primary rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg font-semibold"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img
          src="/professional-person-working-on-laptop-with-social-.jpg"
          alt="Professional workspace"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      <Modal isOpen={modal.isOpen} onClose={closeModal} title={modal.title}>
        <div className="text-center py-4">
          <div className="mb-6">
            {modal.type === 'success' ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
            )}
          </div>
          <p className="text-gray-700 mb-8 text-base leading-relaxed px-4">
            {modal.message}
          </p>
          <div className="flex gap-3">
            {modal.type === 'success' ? (
              <Button
                onClick={handleSuccessClose}
                className="flex-1 h-12 text-base"
              >
                Go to Login
              </Button>
            ) : (
              <Button
                onClick={closeModal}
                className="flex-1 h-12 text-base"
                variant="outline"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
