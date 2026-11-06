'use client';

import { CiBank } from 'react-icons/ci';

interface PaymentMethodSelectorProps {
  onSelectBank: () => void;
  onSelectCrypto: () => void;
  isLoading?: boolean;
}

export function PaymentMethodSelector({
  onSelectBank,
  onSelectCrypto,
  isLoading = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <div className="text-center mb-4 sm:mb-6">
        <p className="text-[10px] sm:text-sm text-muted-foreground">
          Select how you'd like to fund your wallet
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Bank Transfer Option */}
        <button
          onClick={onSelectBank}
          disabled={isLoading}
          className="group relative rounded-lg sm:rounded-2xl p-3 sm:p-6 border-2 border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all duration-300 disabled:opacity-50"
        >
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center bg-blue-200 dark:bg-blue-500/30 mb-2 sm:mb-3 group-hover:bg-blue-300 dark:group-hover:bg-blue-500/40 transition-colors">
              <CiBank className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-foreground text-xs sm:text-lg">Bank</h3>
            <p className="text-[10px] sm:text-sm text-muted-foreground mt-1 sm:mt-2">Virtual Account</p>
          </div>
        </button>

        {/* Crypto Option */}
        <div className="relative">
          <button
            onClick={onSelectCrypto}
            className="group relative w-full rounded-lg sm:rounded-2xl p-3 sm:p-6 border-2 border-orange-200 dark:border-orange-500/40 bg-orange-50 dark:bg-orange-500/10 hover:border-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all duration-300"
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center bg-orange-200 dark:bg-orange-500/30 mb-2 sm:mb-3 text-2xl">
                ₿
              </div>
              <h3 className="font-semibold text-foreground text-xs sm:text-lg">
                Crypto
              </h3>
              <p className="text-[10px] sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                BTC, ETH, etc.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}