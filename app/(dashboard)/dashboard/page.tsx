'use client';

import { PlatformSelector } from '@/components/dashboard/platform-selector';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { CategoryTabs } from '@/components/dashboard/category-tabs';
import { AccountsList } from '@/components/dashboard/accounts-list';
import { useEffect, useState } from 'react';
import { CommunityAnnouncement } from '@/app/components/community-announcement';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Monitor, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isOpen, setIsOpen] = useState(true);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    const checkPanelAndPromo = async () => {
      // 1. Check if user already has a panel
      try {
        const res = await fetch('/api/user/child-panel');
        const data = await res.json();
        if (data.exists && data.status !== 'rejected') {
          setShowPromo(false);
          return; // Don't show promo if they already have a panel
        }
      } catch (err) {
        console.error("Failed to check panel status", err);
      }

      // 2. Fallback to localStorage check if no panel exists
      const dismissedAt = localStorage.getItem('promo-banner-dismissed-at');
      if (dismissedAt) {
        const now = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (now - parseInt(dismissedAt) > twentyFourHours) {
          setShowPromo(true);
          localStorage.removeItem('promo-banner-dismissed-at');
        } else {
          setShowPromo(false);
        }
      } else {
        setShowPromo(true);
      }
    };

    checkPanelAndPromo();
  }, []);

  const dismissPromo = () => {
    setShowPromo(false);
    // Store the exact time of dismissal
    localStorage.setItem('promo-banner-dismissed-at', new Date().getTime().toString());
  };

  useEffect(() => {
    // Whenever platform changes, reset to 'all'
    setSelectedCategory('all');
  }, [selectedPlatform]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] // Custom quintic ease-out
      }}
      className="p-6 lg:p-8 bg-background"
    >
      {/* Stats section */}
      <StatsCards />

      {/* Promotion Banner */}
      <AnimatePresence>
        {showPromo && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-blue-500/20">
              {/* Close Button */}
              <button
                onClick={dismissPromo}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors group"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5 opacity-70 group-hover:opacity-100" />
              </button>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
                    <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    New Partnership Featuress
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                    API & Child Panel Solutions
                  </h2>
                  <p className="text-blue-100 text-sm md:text-base max-w-xl">
                    Take your business to the next level with our upcoming white-label panels and
                    robust programmatic access. Automate your orders and launch your own empire today.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                  <Link
                    href="/dashboard/developer-api"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold transition-all shadow-lg group"
                  >
                    <Terminal className="w-4 h-4" />
                    Go to API
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/dashboard/child-panel"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold transition-all group"
                  >
                    <Monitor className="w-4 h-4" />
                    Explore Child Panel
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform selector section */}
      <div className="mb-6">
        <PlatformSelector
          selectedPlatform={selectedPlatform}
          onPlatformChange={(platformId) => {
            setSelectedPlatform(platformId);
            setSelectedCategory('all'); // reset category when platform changes
          }}
        />
      </div>

      {/* Dynamic subcategory tabs */}
      <div className="mb-6">
        <CategoryTabs
          selectedPlatform={selectedPlatform}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Accounts list filtered by platform + subcategory */}
      <AccountsList
        selectedPlatform={selectedPlatform}
        selectedCategory={selectedCategory}
      />
      <CommunityAnnouncement
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </motion.div>
  );
}
