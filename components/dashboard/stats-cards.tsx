'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, CreditCard, Gem, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { motion, AnimatePresence } from 'framer-motion';

export function StatsCards() {
  const { currency, formatAmount, usdRate } = useCurrency();
  const [totalSpent, setTotalSpent] = useState(0);
  const [balance, setBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(0);
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();

        if (userData.success && userData.user) {
          setBalance(userData.user.walletBalance || 0);
          setReferralBalance(userData.user.referralBalance || 0);
        }

        const purchasesRes = await fetch('/api/user/purchases');
        const purchasesData = await purchasesRes.json();

        if (purchasesData.success) {
          const purchases = purchasesData.purchases || [];
          const total = purchases.reduce(
            (acc: number, curr: any) => acc + (curr.totalAmount || 0),
            0
          );
          setTotalSpent(total);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        {/* Total Balance Card */}
        <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg md:rounded-xl flex-shrink-0">
                <svg
                  className="w-4 h-4 md:w-6 md:h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs md:text-sm text-muted-foreground">
                  Total Balance
                </div>
                <div className="text-lg md:text-2xl font-bold text-foreground leading-tight">
                  {formatAmount(balance)}
                </div>
                <div className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5">
                  {currency === 'NGN' ? (
                    `≈ $${(balance / usdRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                  ) : (
                    `≈ ₦${balance.toLocaleString()} NGN`
                  )}
                </div>
              </div>
            </div>

            {/* Fund Wallet — shared layout origin */}
            {!showSelectorModal && (
              <motion.button
                layoutId="fund-wallet-panel"
                onClick={() => setShowSelectorModal(true)}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm px-3 md:px-4 h-8 md:h-10 rounded-lg md:rounded-xl flex-shrink-0 font-medium"
                style={{ borderRadius: 10 }}
              >
                Fund Wallet
              </motion.button>
            )}
            {/* Placeholder so card doesn't jump when button hides */}
            {showSelectorModal && (
              <div className="h-8 md:h-10 w-[90px] flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg md:rounded-xl flex-shrink-0">
              <CreditCard color="currentColor" className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground">Total Spent</div>
              <div className="text-lg md:text-2xl font-bold text-foreground">
                {formatAmount(totalSpent)}
              </div>
            </div>
          </div>
        </div>

        {/* Referral Balance Card */}
        <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg md:rounded-xl flex-shrink-0">
                <Gem color="currentColor" className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs md:text-sm text-muted-foreground">
                  Referral Balance
                </div>
                <div className="text-lg md:text-2xl font-bold text-foreground">
                  {formatAmount(referralBalance)}
                </div>
              </div>
            </div>
            <Link href="/referrals">
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Shared-layout expanded panel — morphs from the button */}
      <AnimatePresence>
        {showSelectorModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30"
              onClick={() => setShowSelectorModal(false)}
            />

            {/* Expanded panel — same layoutId as the button */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                key="panel"
                layoutId="fund-wallet-panel"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-sm pointer-events-auto dark:bg-slate-900/90 dark:backdrop-blur-xl overflow-hidden"
                style={{ borderRadius: 16 }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.15, delay: 0.05 } }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  className="p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-foreground">Choose Payment Method</h2>
                    <button
                      onClick={() => setShowSelectorModal(false)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <PaymentMethodSelector
                    onSelectBank={() => {
                      setShowSelectorModal(false);
                      router.push('/add-funds?method=bank');
                    }}
                    onSelectCrypto={() => {
                      setShowSelectorModal(false);
                      router.push('/add-funds?method=crypto');
                    }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
