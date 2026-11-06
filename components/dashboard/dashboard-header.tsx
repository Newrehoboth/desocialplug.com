'use client';

import { Bell, X, Moon, Sun, Globe, Terminal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// ... existing imports ...
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from 'next-themes';

interface Notification {
  id: string;
  type: 'purchase' | 'new_account' | 'payment' | 'notification';
  title: string;
  message: string;
  timestamp: any;
  read?: boolean;
  source?: 'purchases' | 'uploads' | 'notifications';
}

export function DashboardHeader() {
  const { currency, setCurrency } = useCurrency();
  const { setTheme, theme } = useTheme();
  const [user, setUser] = useState<{
    username?: string;
    email?: string;
    profileImage?: string;
    status?: string;
    createdAt?: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.createdAt) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
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
    setIsEditingProfile(true);
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
        setIsEditingProfile(false);
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

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditedUsername('');
    setEditedEmail('');
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
        alert('Password reset email sent! Check your inbox.');
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

  const handleLogout = async () => {
    try {
      // Clear promo dismissal on logout
      localStorage.removeItem('promo-banner-dismissed-at');
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div 
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
      className="sticky top-0 z-50 bg-background border-b px-4 md:px-6 pb-3 md:pb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {/* API Link */}
          <Link 
            href="/dashboard/developer-api"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors border border-border rounded-lg bg-background/50 hover:bg-background"
          >
            <Terminal className="w-4 h-4 text-blue-500" />
            <span>API</span>
          </Link>

          {/* Currency Switcher */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1 mr-1 md:mr-2">
            <button
              onClick={() => setCurrency('NGN')}
              className={cn(
                "px-2 py-1 text-[10px] md:text-xs font-bold rounded-md transition-all duration-300 ease-in-out transform",
                currency === 'NGN'
                  ? "bg-background text-primary shadow-sm scale-105"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              )}
            >
              NGN
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={cn(
                "px-2 py-1 text-[10px] md:text-xs font-bold rounded-md transition-all duration-300 ease-in-out transform",
                currency === 'USD'
                  ? "bg-background text-primary shadow-sm scale-105"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              )}
            >
              USD
            </button>
          </div>

          {/* Mobile API Link */}
          <Link 
            href="/dashboard/developer-api"
            className="flex sm:hidden items-center justify-center w-10 h-10 rounded-full border border-gray-200"
          >
            <Terminal className="w-5 h-5 text-gray-700" />
          </Link>

          {/* Notifications dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full border border-gray-200 md:bg-transparent"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-[calc(100vw-2rem)] md:w-80 max-w-md"
            >
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[60vh] md:max-h-96 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-center text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start p-4 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="font-semibold flex items-center gap-2">
                        {notification.title}
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {notification.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.timestamp)}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {notifications.length > 0 && unreadCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      onClick={handleMarkAllAsRead}
                      className="w-full text-xs font-semibold"
                      size="sm"
                      variant="outline"
                    >
                      Mark all as read
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 md:h-12 md:w-12 rounded-full p-0 border border-border"
              >
                <Avatar className="h-9 w-9 md:h-10 md:w-10">
                  <AvatarImage
                    src={user?.profileImage || '/image/avater.jpeg'}
                  />
                  <AvatarFallback className="bg-primary text-white">
                    {user?.username?.slice(0, 2).toUpperCase() || 'DT'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px] p-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={user?.profileImage || '/image/avater.jpeg'}
                  />
                  <AvatarFallback className="bg-primary text-white">
                    {user?.username?.slice(0, 2).toUpperCase() || 'DT'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {isEditingProfile ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Username"
                      />
                      <input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Email"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold text-base">
                        {user?.username || 'Loading...'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user?.email || 'No email found'}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isEditingProfile ? (
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 justify-center"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    disabled={isSaving}
                    className="flex-1 justify-center"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  className="w-full mb-4 justify-center bg-transparent"
                >
                  Edit Profile
                </Button>
              )}

              <Button
                onClick={handleResetPassword}
                disabled={isResettingPassword}
                variant="ghost"
                className="w-full mb-4 justify-start px-2 text-sm text-gray-600 hover:text-primary"
              >
                {isResettingPassword ? 'Sending Email...' : 'Reset Password'}
              </Button>

              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">Theme Mode</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${theme === 'light'
                      ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'bg-background border-border text-muted-foreground'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Sun className="w-5 h-5" />
                      <span className="text-xs font-medium">Light</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${theme === 'dark'
                      ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'bg-background border-border text-muted-foreground'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Moon className="w-5 h-5" />
                      <span className="text-xs font-medium">Dark</span>
                    </div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex gap-2 py-2 text-red-500 rounded-lg transition-colors hover:bg-red-50"
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
            className="rounded-full hover:bg-gray-100 bg-gray-100 md:bg-transparent"
          >
            <X className="w-5 h-5 text-gray-700" />
          </Button>
        </div>
      </div>
    </div>
  );
}
