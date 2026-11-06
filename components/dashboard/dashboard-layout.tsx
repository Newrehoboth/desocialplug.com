'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Sidebar } from './sidebar';
import { DashboardHeader } from './dashboard-header';
import { Menu, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface Notification {
  id: string;
  type: 'purchase' | 'new_account' | 'payment' | 'notification';
  title: string;
  message: string;
  timestamp: any;
  read?: boolean;
  source?: 'purchases' | 'uploads' | 'notifications';
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<{
    username?: string;
    email?: string;
    profileImage?: string;
    createdAt?: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll on navigation
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [pathname]);





  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.createdAt) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.createdAt]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(
          data.notifications.filter((n: Notification) => !n.read).length,
        );
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await fetch(`/api/notifications/${n.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true }),
        });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    setNotifications((prev) =>
      prev.map((it) => (it.id === n.id ? { ...it, read: true } : it)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setSelectedNotification(n);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleEditProfile = () => {
    setEditedUsername(user?.username || '');
    setEditedEmail(user?.email || '');
    setResetPasswordSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editedUsername, email: editedEmail }),
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setIsEditModalOpen(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      alert('No email found for this account');
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();

      if (data.success) {
        setResetPasswordSuccess(true);
        setTimeout(() => setResetPasswordSuccess(false), 5000);
      } else {
        alert(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Failed to send password reset email:', err);
      alert('Failed to send password reset email. Please try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditedUsername('');
    setEditedEmail('');
    setResetPasswordSuccess(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transition-all duration-300 ease-in-out lg:translate-x-0 lg:visible lg:opacity-100 lg:pointer-events-auto ${
          sidebarOpen
            ? 'translate-x-0 opacity-100 visible pointer-events-auto'
            : '-translate-x-full opacity-0 invisible pointer-events-none lg:translate-x-0 lg:opacity-100 lg:visible lg:pointer-events-auto'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:h-screen lg:overflow-hidden">
        {/* MOBILE HEADER with full logic */}
        <div 
          style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
          className="lg:hidden sticky top-0 z-30 shrink-0 px-4 pb-3 bg-background border-b flex items-center justify-between"
        >
          <div className="ml-4">
            <Link href="/dashboard">
              <Image
                src="/image/DeSocial Plug AW2.png"
                width={100}
                height={100}
                alt="Logo"
                className="w-[19%]"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Currency Switcher */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1 mr-1">
              <button
                onClick={() => setCurrency('NGN')}
                className={cn(
                  "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                  currency === 'NGN' 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                NGN
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={cn(
                  "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                  currency === 'USD' 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                USD
              </button>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 relative rounded-full border border-gray-200"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-72 ml-8">
                <DropdownMenuLabel className="flex justify-between items-center text-xs">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                      {unreadCount}
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-60 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-2 text-center text-xs text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className="flex flex-col items-start p-2 cursor-pointer"
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className="text-xs font-semibold flex items-center gap-1">
                          {n.title}
                          {!n.read && (
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {n.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatTimeAgo(n.timestamp)}
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="p-1">
                      <Button
                        onClick={handleMarkAllAsRead}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-1 h-auto"
                      >
                        View All & Mark as Read
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full border border-border p-0"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={user?.profileImage || '/image/avater.jpeg'}
                    />
                    <AvatarFallback className="bg-primary text-white">
                      {user?.username?.slice(0, 2).toUpperCase() || 'DT'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-[270px] p-3">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user?.profileImage || '/image/avater.jpeg'}
                    />
                    <AvatarFallback className="bg-primary text-white">
                      {user?.username?.slice(0, 2).toUpperCase() || 'LF'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {user?.username || 'Loading...'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user?.email || 'No email found'}
                    </div>
                  </div>
                </div>

                <DropdownMenuItem onSelect={handleEditProfile} asChild>
                  <Button
                    variant="outline"
                    className="w-full mb-4 bg-transparent cursor-pointer"
                  >
                    Edit Profile
                  </Button>
                </DropdownMenuItem>

                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">Theme Mode</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                        theme === 'light'
                          ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'bg-background border-border text-muted-foreground'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
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
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span className="text-xs font-medium">Light</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'bg-background border-border text-muted-foreground'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
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
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                        <span className="text-xs font-medium">Dark</span>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex gap-2 py-2 text-red-500 rounded-lg transition-colors"
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
                  <span className="font-medium">Logout</span>
                </button>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <DashboardHeader />
        </div>

        <div ref={contentRef} className="flex-1 lg:overflow-y-auto pb-12 lg:pb-6">{children}</div>
      </div>

      {/* NOTIFICATION POPUP FOR MOBILE */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl relative animate-in fade-in zoom-in border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Notification Details
              </h3>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {selectedNotification.type}
                  </span>
                  {!selectedNotification.read && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      New
                    </span>
                  )}
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {selectedNotification.title}
                </h4>

                <div className="text-sm text-gray-500 mb-4">
                  {formatTimeAgo(selectedNotification.timestamp)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                <div>
                  <div className="text-gray-500">Notification ID</div>
                  <div className="font-medium text-gray-900 truncate">
                    {selectedNotification.id}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Source</div>
                  <div className="font-medium text-gray-900 capitalize">
                    {selectedNotification.source || 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
                {!selectedNotification.read && (
                  <button
                    onClick={async () => {
                      try {
                        await fetch(
                          `/api/notifications/${selectedNotification.id}`,
                          {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ read: true }),
                          },
                        );
                        setNotifications((prev) =>
                          prev.map((n) =>
                            n.id === selectedNotification.id
                              ? { ...n, read: true }
                              : n,
                          ),
                        );
                        setSelectedNotification({
                          ...selectedNotification,
                          read: true,
                        });
                      } catch (error) {
                        console.error('Failed to mark as read:', error);
                      }
                    }}
                    className="flex-1 py-3 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancelEdit}
          />

          <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Edit Profile
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update your profile information and reset your password
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Username
                </label>
                <input
                  type="text"
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>

              <div className="border-t border-border pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Click the button below to receive a password reset link via
                    email
                  </p>
                  <button
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isResettingPassword ? 'Sending...' : 'Reset Password'}
                  </button>
                  {resetPasswordSuccess && (
                    <div className="flex items-center gap-2 text-sm text-green-600 mt-2 bg-green-50 p-2 rounded">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Password reset email sent! Check your inbox.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-background border border-border text-foreground rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
