'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'NGN' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  usdRate: number;
  formatAmount: (nairaAmount: number) => string;
  convertAmount: (nairaAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('NGN');
  const [usdRate, setUsdRate] = useState(1300); // Fixed rate: $1 = ₦1300

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('app_currency') as Currency;
    if (savedCurrency === 'NGN' || savedCurrency === 'USD') {
      setCurrencyState(savedCurrency);
    }

    // Rate is fixed at $1 = ₦1300 — no live fetch needed
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('app_currency', newCurrency);
  };

  const convertAmount = (nairaAmount: number): number => {
    if (currency === 'NGN') return nairaAmount;
    return nairaAmount / usdRate;
  };

  const formatAmount = (nairaAmount: number): string => {
    const amount = convertAmount(nairaAmount);
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, usdRate, formatAmount, convertAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
