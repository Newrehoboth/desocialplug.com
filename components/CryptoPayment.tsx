'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, ExternalLink, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from '@/context/CurrencyContext';

interface CryptoPaymentProps {
  userId: string;
  userName: string;
  userEmail: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export function CryptoPayment({
  userId,
  userName,
  userEmail,
  onSuccess,
  onBack,
}: CryptoPaymentProps) {
  const { usdRate, currency } = useCurrency();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handleProceedToPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

      const response = await fetch('/api/payments/heleket-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          userEmail,
          amount: parseFloat(amount),
          currency: 'USD',
          callbackUrl: `${baseUrl}/api/payments/heleket-webhook`,
          returnUrl: `${baseUrl}/dashboard?payment=success`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.payment_url) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setPaymentUrl(data.payment_url);
      toast.success('Payment URL created! Opening checkout...');

      setTimeout(() => {
        window.open(data.payment_url, '_blank');
      }, 1500);

      onSuccess?.();
    } catch (error: any) {
      console.error('Payment creation error:', error);
      toast.error(error.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to payment methods
        </button>
      )}

      <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="text-3xl">₿</div>
          <div>
            <h3 className="font-semibold text-foreground">Cryptocurrency Payment</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Pay with Bitcoin, Ethereum, USDT, or other cryptocurrencies
            </p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-background border border-border rounded-lg p-4 mb-4">
          <label className="text-sm font-medium text-foreground block mb-2">
            Amount (USD)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-foreground">$</span>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              disabled={loading || !!paymentUrl}
              className="flex-1 px-3 py-2 border border-border bg-muted/40 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted-foreground">Minimum: $1.00</p>
            {amount && parseFloat(amount) > 0 && (
              <p className="text-xs font-medium text-primary">
                ≈ ₦{(parseFloat(amount) * usdRate).toLocaleString()} NGN
              </p>
            )}
          </div>
        </div>

        {/* Provider Info */}
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-3 mb-4">
          <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-400">
            <span className="font-semibold">Powered by:</span> Heleket - Secure crypto payment gateway
          </p>
        </div>

        {!paymentUrl ? (
          <button
            onClick={handleProceedToPayment}
            disabled={loading || !amount}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Payment...
              </>
            ) : (
              <>
                Proceed to Payment
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-3 sm:py-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            Open Crypto Checkout
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {onBack && (
          <button
            onClick={onBack}
            className="w-full mt-3 px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Change Payment Method
          </button>
        )}
      </div>

      {/* FAQ */}
      <div className="bg-muted/50 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">FAQ</p>

        <details className="bg-card border border-border p-3 rounded-lg cursor-pointer">
          <summary className="font-medium text-foreground text-sm">
            Which cryptocurrencies are supported?
          </summary>
          <p className="text-sm text-muted-foreground mt-2">
            Bitcoin, Ethereum, USDT, USDC, and many other major cryptocurrencies are accepted.
          </p>
        </details>

        <details className="bg-card border border-border p-3 rounded-lg cursor-pointer">
          <summary className="font-medium text-foreground text-sm">
            How long does payment take?
          </summary>
          <p className="text-sm text-muted-foreground mt-2">
            Payments are typically confirmed within 10-30 minutes depending on blockchain confirmation.
          </p>
        </details>

        <details className="bg-card border border-border p-3 rounded-lg cursor-pointer">
          <summary className="font-medium text-foreground text-sm">
            Are there any additional fees?
          </summary>
          <p className="text-sm text-muted-foreground mt-2">
            Network fees apply based on the cryptocurrency and current blockchain conditions.
          </p>
        </details>
      </div>
    </div>
  );
}
