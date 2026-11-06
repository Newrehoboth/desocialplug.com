'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface CommunityAnnouncementProps {
  onClose?: () => void;
  isOpen?: boolean;
}

const DISABLE_KEY = 'community_announcement_disabled_until';
const JOINED_KEY = 'community_announcement_joined';
const TWO_HOURS = 2 * 60 * 60 * 1000; // 2 hours in ms

export function CommunityAnnouncement({
  onClose,
  isOpen = true,
}: CommunityAnnouncementProps) {
  const [open, setOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // If user already joined any channel → NEVER show again
    const hasJoined = localStorage.getItem(JOINED_KEY);
    if (hasJoined === 'true') {
      setOpen(false);
      return;
    }

    // Temporary disable logic (2 hours)
    const disabledUntil = localStorage.getItem(DISABLE_KEY);
    if (disabledUntil && Date.now() < Number(disabledUntil)) {
      setOpen(false);
      return;
    }

    // Delay showing the pop-up by 6 seconds
    const timer = setTimeout(() => {
      setOpen(true);
      // Small delay for animation
      setTimeout(() => {
        setShowContent(true);
      }, 50);
    }, 3000); // 4 seconds delay

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setShowContent(false);
    setTimeout(() => {
      setOpen(false);
      onClose?.();
    }, 300);
  };

  const handleDisableFor2Hours = () => {
    const disableUntil = Date.now() + TWO_HOURS;
    localStorage.setItem(DISABLE_KEY, disableUntil.toString());
    setShowContent(false);
    setTimeout(() => {
      setOpen(false);
      onClose?.();
    }, 300);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`relative w-full max-w-md rounded-2xl md:rounded-3xl bg-card border border-border text-foreground p-4 md:p-6 shadow-xl md:shadow-2xl transition-all duration-300 transform ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-2 md:right-4 top-2 md:top-4 flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
          aria-label="Close announcement"
        >
          <X
            className="h-3.5 w-3.5 md:h-4 md:w-4 text-foreground"
            strokeWidth={2.5}
          />
        </button>

        {/* Header */}
        <div className="mb-3 md:mb-4 flex items-center gap-2">
          <span className="text-2xl md:text-4xl">📢</span>
          <h1 className="text-lg md:text-xl font-bold text-foreground">
            Community Announcement
          </h1>
        </div>

        {/* Main Message */}
        <div className="mb-3 md:mb-4 rounded-xl bg-muted/60 dark:bg-muted/40 border border-border/50 p-3 md:p-4 text-center">
          <p className="text-xs md:text-sm text-foreground font-medium">
            Stay connected with us and never miss important updates 🚀
          </p>
        </div>

        {/* Subtitle */}
        <div className="mb-2 md:mb-3 text-center">
          <span className="inline-block rounded-full bg-muted border border-border/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            Join our official communities to get:
          </span>
        </div>

        {/* Benefits */}
        <div className="mb-3 md:mb-4 flex justify-center">
          <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-foreground/90 font-medium">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">🔔</span>
              <span>Service updates & announcements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">🎁</span>
              <span>Weekend logs giveaways</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">⚡</span>
              <span>Early access & special drops</span>
            </li>
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="mb-3 md:mb-4 text-center">
          <span className="inline-block rounded-full bg-muted/80 border border-border/40 px-2.5 py-1 text-xs text-muted-foreground">
            No spam • Official channels only
          </span>
        </div>

        {/* Buttons */}
        <div className="space-y-2 md:space-y-3">
          <a
            href="https://t.me/desocialplug"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl bg-blue-600 px-3 md:px-4 py-2.5 md:py-3 text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            <span className="text-lg md:text-xl">✈️</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm font-semibold truncate">
                Join Telegram Channel
              </div>
              <div className="text-xs text-blue-100">
                Updates & announcements
              </div>
            </div>
          </a>

          <a
            href="https://whatsapp.com/channel/0029VbC5maqDDmFXXLgyTw3z"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl bg-green-600 px-3 md:px-4 py-2.5 md:py-3 text-white shadow-md hover:bg-green-700 transition-colors"
          >
            <span className="text-lg md:text-xl">🎁</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm font-semibold truncate">
                Join WhatsApp Channel
              </div>
              <div className="text-xs text-green-100">
                Weekend giveaways only
              </div>
            </div>
          </a>
        </div>

        {/* Disable Button */}
        <div className="mt-3 md:mt-4 text-center">
          <button
            onClick={handleDisableFor2Hours}
            className="mt-1 md:mt-2 inline-flex items-center justify-center rounded-full border border-border px-3 md:px-4 py-1.5 md:py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            ⏳ Don't show this again for 2 hours
          </button>
        </div>

        {/* Footer */}
        <div className="mt-2 md:mt-3 text-center">
          <p className="text-sm font-medium text-foreground">Stay tuned 🎁 😄</p>
          <p className="text-xs text-muted-foreground mt-1">
            You can close this anytime.
          </p>
        </div>
      </div>
    </div>

  );
}
