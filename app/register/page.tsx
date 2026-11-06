'use client';

import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Header } from '@/components/header';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    referralCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle referral code from URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData((prev) => ({
        ...prev,
        referralCode: ref,
      }));
    }
  }, [searchParams]);

  // TikTok Pixel initialization check
  useEffect(() => {
    // Ensure TikTok pixel is loaded
    if (typeof window !== 'undefined' && !window.ttq) {
      console.warn('TikTok pixel not loaded');
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

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      return setModal({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields',
      });
    }

    const phoneNormalized = formData.phone.trim();
    const phoneRegex = /^\+?\d{7,15}$/;
    if (!phoneRegex.test(phoneNormalized)) {
      return setModal({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a valid phone number.',
      });
    }

    if (formData.password.length < 6) {
      return setModal({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Password must be at least 6 characters.',
      });
    }

    const username = formData.username.trim();
    const lowerUsername = username.toLowerCase();
    const emailLikePattern = /[@.]/;

    if (emailLikePattern.test(lowerUsername)) {
      return setModal({
        isOpen: true,
        type: 'error',
        title: 'Invalid Username',
        message: "Username cannot contain '@' or '.'.",
      });
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: phoneNormalized,
          referralCode: formData.referralCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // ✅ Track TikTok CompleteRegistration event ONLY on successful signup
      if (data.success === true && typeof window !== 'undefined' && window.ttq) {
        try {
          window.ttq.track('CompleteRegistration', {
            content_name: 'user_registration',
            content_type: 'registration',
            value: 0,
            currency: 'NGN',
          });
          console.log('✅ TikTok CompleteRegistration event tracked');
        } catch (trackError) {
          console.error('TikTok tracking error:', trackError);
        }
      }

      setModal({
        isOpen: true,
        type: 'success',
        title: 'Registration Successful!',
        message: 'Your account has been created.',
      });

      setFormData({
        username: '',
        email: '',
        password: '',
        phone: '',
        referralCode: '',
      });

      setTimeout(() => {
        router.push('/dashboard'); // Direct to dashboard since session is created
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3 lg:mb-4">
                Register
              </h1>
              <p className="text-muted-foreground text-base lg:text-lg">
                Create an account and unlock a vast selection of premium social
                media accounts.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-12 h-14 bg-muted/40 border border-border focus:border-primary rounded-xl"
                />
              </div>

            {/* Email */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className="pl-12 h-14 bg-muted/40 border border-border focus:border-primary rounded-xl"
              />
            </div>

            {/* Phone */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Phone className="w-5 h-5" />
              </div>
              <Input
                type="tel"
                name="phone"
                placeholder="Phone (e.g. 08012345678)"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading}
                className="pl-12 h-14 bg-muted/40 border border-border focus:border-primary rounded-xl"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className="pl-12 pr-12 h-14 bg-muted/40 border border-border focus:border-primary rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Referral Code */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <User className="w-5 h-5" />
              </div>
              <Input
                type="text"
                name="referralCode"
                placeholder="Referral Code (optional)"
                value={formData.referralCode}
                onChange={handleInputChange}
                disabled={isLoading}
                className="pl-12 h-14 bg-muted/40 border border-border focus:border-primary rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg font-semibold mt-6"
            >
              {isLoading ? 'REGISTERING...' : 'REGISTER →'}
            </Button>
          </form>

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
            Sign up with Google
          </Button>

          <p className="text-center mt-8 text-base text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img
          src="/happy-person-using-social-media-on-phone-with-colo.jpg"
          alt="Happy person using social media"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8">
            <h2 className="text-4xl font-bold mb-4">Join Thousands of Users</h2>
            <p className="text-xl text-white/90">
              Access premium social media accounts instantly
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Success/Error Modal */}
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
          <Button onClick={closeModal} className="w-full">
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
}
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
