'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Header } from '@/components/header';
import {
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  XCircle,
  X,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
  });

  // State for migration popup
  const [showMigrationPopup, setShowMigrationPopup] = useState(false);

  // Check if migration popup has been shown before
  useEffect(() => {
    const hasSeenMigrationPopup = localStorage.getItem('hasSeenMigrationPopup');

    if (!hasSeenMigrationPopup) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setShowMigrationPopup(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a valid email address',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Login Successful!',
          message: 'Welcome back! Redirecting to dashboard...',
        });

        // Store user info in localStorage for convenience (optional, session is in cookie)
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Login Failed',
          message: data.error || 'Invalid login details',
        });
      }
    } catch (error: any) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleMigrationPopupClose = () => {
    setShowMigrationPopup(false);
    // Mark as seen so it doesn't show automatically again
    localStorage.setItem('hasSeenMigrationPopup', 'true');
  };

  const handleForgotPasswordRedirect = () => {
    handleMigrationPopupClose();
    router.push('/forgot-password');
  };

  // Function to manually show the migration popup again
  const showMigrationPopupAgain = () => {
    setShowMigrationPopup(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 flex">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3 lg:mb-4 animate-fade-in">
                Login
              </h1>
              <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                Welcome back! Sign in to access your premium social media
                accounts.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary transition-transform group-focus-within:scale-110">
                  <Mail className="w-5 h-5" />
                </div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-12 h-14 bg-muted/40 border border-border focus:border-primary focus:bg-background rounded-xl text-base transition-all disabled:opacity-50"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary transition-transform group-focus-within:scale-110">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-12 pr-12 h-14 bg-muted/40 border border-border focus:border-primary focus:bg-background rounded-xl text-base transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  className="rounded border-border text-primary focus:ring-primary transition-all disabled:opacity-50"
                />
                <span className="text-muted-foreground group-hover:text-foreground">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-primary font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg font-semibold mt-6 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? 'LOGGING IN...' : 'LOGIN →'}
            </Button>
          </form>

          {/* Migration Help Link */}
          {/* <div className="mt-4 text-center">
            <button
              onClick={showMigrationPopupAgain}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              <Info className="w-4 h-4" />
              Having trouble logging in? Click here for help
            </button>
          </div> */}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">OR</span>
            </div>
          </div>

          <Button
            onClick={() => (window.location.href = '/api/auth/google')}
            variant="outline"
            className="w-full h-14 bg-background hover:bg-muted/40 border border-border rounded-xl text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

          <p className="text-center mt-8 text-base text-muted-foreground">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img
          src="/professional-person-working-on-laptop-with-social-.jpg"
          alt="Professional person working on laptop with social media"
          className="w-full h-full object-cover animate-fade-in"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Continue managing your premium social media accounts with ease
            </p>
          </div>
        </div>
      </div>
      </div>

      <Modal isOpen={modal.isOpen} onClose={closeModal} title={modal.title}>
        <div className="text-center">
          <div className="mb-4">
            {modal.type === 'success' ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
          </div>
          <p className="text-muted-foreground mb-6">{modal.message}</p>
          <div className="flex gap-3">
            <Button
              onClick={closeModal}
              className="flex-1"
              variant={modal.type === 'success' ? 'default' : 'outline'}
            >
              {modal.type === 'success' ? 'Continue' : 'Try Again'}
            </Button>
            {modal.type === 'success' && (
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex-1"
                variant="outline"
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
