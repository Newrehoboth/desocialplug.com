'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
  });

  // Real-time email validation
  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError('');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.trim()) {
      validateEmail(value);
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();

    // Validate email before submission
    if (!trimmed) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(trimmed)) {
      return;
    }

    setIsLoading(true);
    setEmailError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      // Success - show modal
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Check Your Email',
        message: `We've sent password reset instructions to ${trimmed}. Please check your inbox and spam folder.`,
      });

      // Clear the email field
      setEmail('');
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Unable to Send Email',
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

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Back to Login Link */}
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Login</span>
          </button>

          {/* Header */}
          <div className="mb-8 lg:mb-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
              Forgot Password?
            </h1>
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
              No worries! Enter your email address and we'll send you
              instructions to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  className={`pl-12 h-14 bg-gray-50 border ${
                    emailError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-primary'
                  } focus:bg-white rounded-xl text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-sm mt-2 ml-1">{emailError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email.trim() || !!emailError}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-primary font-semibold hover:underline transition-all"
              >
                Sign in
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img
          src="/professional-person-working-on-laptop-with-social-.jpg"
          alt="Professional workspace"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 max-w-lg">
            <div className="mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4">Reset Your Password</h2>
            <p className="text-xl text-white/90 leading-relaxed">
              We'll send you a secure link to create a new password and regain
              access to your account.
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Modal */}
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
              <>
                <Button
                  onClick={closeModal}
                  className="flex-1 h-12 text-base"
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push('/login')}
                  className="flex-1 h-12 text-base"
                >
                  Back to Login
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
