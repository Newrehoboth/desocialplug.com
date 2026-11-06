'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CiBank, CiCircleInfo, CiCreditCard1 } from 'react-icons/ci';
import { Wallet, ArrowRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { FaRegCopy, FaUser } from 'react-icons/fa6';
import Image from 'next/image';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { CryptoPayment } from '@/components/CryptoPayment';

interface UserData {
  _id: string;
  email: string;
  username: string;
  phone?: string;
}

export default function AddFundsPage() {
  return (
    <Suspense fallback={
      <div className="bg-background min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    }>
      <AddFundsContent />
    </Suspense>
  );
}

function AddFundsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const initialMethod = searchParams.get('method') as 'bank' | 'crypto' | null;
  const validMethod = initialMethod === 'bank' || initialMethod === 'crypto' ? initialMethod : null;
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'crypto' | null>(validMethod);
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<{
    id?: string;
    bankName: string;
    bank: string;
    accountNumber: string;
    accountName: string;
    status?: string;
  } | null>(null);
  const [vaError, setVaError] = useState<string | null>(null);

  const [initialBalance, setInitialBalance] = useState<number | null>(null);

  // Main initialization — fetch user from MongoDB session
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!data.success || !data.user) {
          console.log('No user logged in');
          setLoading(false);
          return;
        }

        setUser(data.user);
        setInitialBalance(data.user.walletBalance || 0);

        // ZERO-LOADING: If virtual account is already in the user object, use it instantly!
        if (data.user.virtualAccount) {
          setVirtualAccount({
            id: data.user.virtualAccount._id,
            bank: data.user.virtualAccount.bank,
            bankName: data.user.virtualAccount.bankName,
            accountNumber: data.user.virtualAccount.accountNumber,
            accountName: data.user.virtualAccount.accountName,
            status: data.user.virtualAccount.status,
          });
          // Explicitly set loading to false since we have everything we need
          setLoading(false);
        } else if (validMethod === 'bank') {
          // Only if we DON'T have it yet, we fetch it
          loadVirtualAccount(data.user);
          return;
        } else {
          setLoading(false);
        }

        // Pre-populate details from user object
        const nameParts = (data.user.username || '').split(' ').filter(Boolean);
        if (nameParts[0]) setFirstName(nameParts[0]);
        if (nameParts.length > 1) setLastName(nameParts.slice(1).join(' '));
        if (data.user.phone) setPhone(data.user.phone);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    init();
  }, []);

  // Payment Watcher: Polling for balance increase
  useEffect(() => {
    if (initialBalance === null || !user) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          const currentBalance = data.user.walletBalance || 0;
          if (currentBalance > initialBalance) {
            toast.success(`Payment Received! Added ₦${(currentBalance - initialBalance).toLocaleString()} to your wallet.`, {
              duration: 5000,
            });
            // Stop polling and redirect after a short delay
            clearInterval(interval);
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Payment watcher error:', err);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [initialBalance, user]);

  // Update showSelectorModal based on paymentMethod
  useEffect(() => {
    if (!paymentMethod) {
      setShowSelectorModal(true);
    } else {
      setShowSelectorModal(false);
    }
  }, [paymentMethod]);

  // Core logic: check existing VA → create if needed → show modal if name missing
  const loadVirtualAccount = async (userData: UserData) => {
    try {
      // If we already have the account info, don't show the full-page spinner
      if (!virtualAccount) {
        setLoading(true);
      }
      setVaError(null);

      const nameParts = (userData.username || '').split(' ').filter(Boolean);
      let initialFirstName = nameParts[0] || '';
      let initialLastName = nameParts.slice(1).join(' ') || '';
      let initialPhone = (userData.phone || '').trim();

      // Auto-fill missing data to ensure seamless VA creation
      if (!initialFirstName) initialFirstName = 'Desocial';
      if (!initialLastName) initialLastName = 'User';
      if (!initialPhone) initialPhone = '09000000000';

      if (initialFirstName) setFirstName(initialFirstName);
      if (initialLastName) setLastName(initialLastName);
      if (initialPhone) setPhone(initialPhone);

      // 1. Check if user already has a virtual account
      try {
        const res = await fetch(
          `/api/pocketfi/virtual-account?userId=${userData._id}`,
        );
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.accountNumber && data.bankName && data.accountName) {
          const vaInfo = {
            id: data.id,
            bank: data.bank,
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            accountName: data.accountName,
            status: data.status,
          };
          setVirtualAccount(vaInfo);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to check existing VA', err);
      }

      // 2. Auto-create since we filled the missing details
      const success = await createVirtualAccount(
        userData._id,
        initialFirstName,
        initialLastName,
        initialPhone,
      );

      if (!success) {
        // Only show modal if API explicitly rejects the auto-generation
        setShowDetailsModal(true);
      }
      setLoading(false);

    } catch (error) {
      console.error('Error in loadVirtualAccount:', error);
      setVaError('Failed to load account details');
      setLoading(false);
    }
  };

  // Shared function to create VA (used both on load and modal submit)
  const createVirtualAccount = async (
    userId: string,
    firstName: string,
    lastName: string,
    phone: string,
  ) => {
    try {
      const res = await fetch('/api/pocketfi/virtual-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMessage = data.details?.message
          ? `${data.error}: ${data.details.message}`
          : data.error || 'Failed to create virtual account';
        throw new Error(errorMessage);
      }

      if (data.accountNumber && data.bankName && data.accountName) {
        setVirtualAccount({
          id: data.id,
          bank: data.bank,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountName: data.accountName,
          status: data.status,
        });
        setVaError(null);
        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('createVirtualAccount error:', err);
      setVaError(err.message || 'Failed to create virtual account');
      return false;
    }
  };

  // Modal submit handler
  const handlePocketfiPayment = async () => {
    if (!user) return toast.error('Please login first');

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirst || !trimmedLast || !trimmedPhone) {
      return toast.error('Please fill in all fields');
    }

    setProcessing(true);
    const success = await createVirtualAccount(
      user._id,
      trimmedFirst,
      trimmedLast,
      trimmedPhone,
    );
    setProcessing(false);

    if (success) setShowDetailsModal(false);
  };

  // Retry button in case of error
  const handleRetry = async () => {
    if (!user) return;
    setVaError(null);
    setLoading(true);
    await loadVirtualAccount(user);
  };

  return (
    <>
      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => !processing && setShowDetailsModal(false)}
        title="Confirm your details"
      >
        <p className="text-sm text-muted-foreground mb-4">
          Please confirm your details so we can create your PocketFi virtual
          account.
        </p>

        {vaError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {vaError}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border-2 border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="px-3 py-2 border-2 border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3 py-2 border-2 border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowDetailsModal(false)}
            disabled={processing}
            className="px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePocketfiPayment}
            disabled={processing}
            className="px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg active:scale-95 transition-all"
          >
            {processing ? (
              <>Creating...</>
            ) : (
              <>
                Save & Continue <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </Modal>

      <main className="min-h-screen bg-background p-3 sm:p-4">
        <div className="max-w-md mx-auto mt-2 sm:mt-4 px-2 sm:px-0">
          {/* Top icon + title */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl mx-auto flex items-center justify-center bg-muted shadow-sm">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold mt-2 sm:mt-3 text-foreground">
              Add Funds
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {paymentMethod ? 'Complete your payment' : 'Choose your payment method'}
            </p>
          </div>

          {/* Selector Modal */}
          <Modal
            isOpen={showSelectorModal}
            onClose={() => setShowSelectorModal(false)}
            title="Choose Payment Method"
          >
            <PaymentMethodSelector
              onSelectBank={() => {
                setShowSelectorModal(false);
                setPaymentMethod('bank');
                if (!virtualAccount && user) {
                  loadVirtualAccount(user);
                }
              }}
              onSelectCrypto={() => {
                setShowSelectorModal(false);
                setPaymentMethod('crypto');
              }}
            />
          </Modal>

          {/* Loader (Only show when creating virtual account) */}
          {loading && paymentMethod === 'bank' ? (
            <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-10 shadow-sm border border-border text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-9 sm:w-9 border-4 border-primary border-t-transparent mx-auto mb-2 sm:mb-3" />
              <p className="text-muted-foreground text-xs sm:text-sm">
                Generating your virtual account...
              </p>
            </div>
          ) : !paymentMethod ? (
            // FALLBACK / TRIGGER VIEW
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-8 text-center">
              <CiCreditCard1 size={48} className="mx-auto text-muted-foreground/40 mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No Method Selected</h2>
              <p className="text-sm text-muted-foreground mb-6">Please select a payment method to proceed.</p>
              <button
                onClick={() => setShowSelectorModal(true)}
                className="w-full py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              >
                Select Payment Method
              </button>
            </div>
          ) : paymentMethod === 'bank' ? (
            // BANK TRANSFER VIEW
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary/90 to-primary p-4 sm:p-5 text-primary-foreground flex items-center justify-between rounded-t-xl sm:rounded-t-2xl">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">
                    Bank Transfer
                  </h2>
                  <p className="text-[11px] sm:text-[13px] opacity-90 mt-1">
                    Virtual Account
                  </p>
                </div>
                <button
                  onClick={() => setPaymentMethod(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Back to payment methods"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                {virtualAccount ? (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Transfer Notice */}
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-[13px] text-muted-foreground flex items-center gap-2 border border-border">
                      <CiCircleInfo size={22} className="sm:w-6 sm:h-6" />
                      <span>Transfer to the virtual account number below</span>
                    </div>

                    {/* ACCOUNT NUMBER */}
                    <div>
                      <p className="text-[11px] sm:text-[12px] text-muted-foreground font-semibold mb-1">
                        Account Number
                      </p>

                      <div className="flex items-center justify-between bg-card mt-1 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl shadow-sm border border-border">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center">
                            <Image
                              src="/image/DeSocial Plug AW2.png"
                              alt="Logo"
                              width={20}
                              height={20}
                              className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                            />
                          </div>

                          <span className="text-base sm:text-lg tracking-wider font-semibold text-foreground">
                            {virtualAccount.accountNumber}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              virtualAccount.accountNumber,
                            );
                            setCopied(true);
                            toast.success('Copied!');
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="flex items-center gap-1.5 sm:gap-2 bg-[#EEF1FF] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-[13px] font-medium text-[#4A5FE2] border cursor-pointer transition-all"
                        >
                          {copied ? (
                            <span className="text-[#4A5FE2] font-semibold">
                              Copied!
                            </span>
                          ) : (
                            <>
                              <FaRegCopy className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* BANK NAME */}
                    <div>
                      <p className="text-[11px] sm:text-[12px] text-muted-foreground font-semibold mb-1">
                        Bank Name
                      </p>

                      <div className="flex items-center gap-3 sm:gap-4 bg-card mt-1 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl shadow-sm border border-border">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center">
                          <CiBank size={20} className="sm:w-6 sm:h-6" />
                        </div>

                        <span className="text-sm sm:text-base font-semibold text-foreground">
                          {virtualAccount.bankName}
                        </span>
                      </div>
                    </div>

                    {/* ACCOUNT NAME */}
                    <div>
                      <p className="text-[11px] sm:text-[12px] text-muted-foreground font-semibold mb-1">
                        Account Name
                      </p>

                      <div className="flex items-center gap-3 sm:gap-4 bg-card mt-1 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl shadow-sm border border-border">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center">
                          <FaUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>

                        <span className="text-xs sm:text-sm font-semibold text-foreground">
                          {virtualAccount.accountName}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] sm:text-xs text-gray-500 text-center">
                      Funds reflect instantly after transfer. 0.9% fee applies.
                    </p>
                  </div>
                ) : vaError ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-red-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                      {vaError}
                    </p>
                    <button
                      onClick={async () => {
                        if (user) {
                          setVaError(null);
                          setLoading(true);
                          await loadVirtualAccount(user);
                        }
                      }}
                      className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#5F4BC0] to-[#7A4DF0] text-white rounded-lg sm:rounded-xl font-medium text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 text-xs sm:text-sm">
                    Your virtual account is being prepared...
                  </p>
                )}
              </div>
            </div>
          ) : paymentMethod === 'crypto' && user ? (
            // CRYPTO PAYMENT VIEW
            <CryptoPayment
              userId={user._id}
              userName={user.username}
              userEmail={user.email}
              onBack={() => setPaymentMethod(null)}
            />
          ) : null
          }

          {/* Bottom Features */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-5 sm:mt-7">
            <div className="bg-card border border-border rounded-lg sm:rounded-2xl p-3 sm:p-4 text-center shadow-sm">
              <div className="text-base sm:text-lg mb-1">⚡</div>
              <p className="font-semibold text-xs sm:text-[13px] text-foreground">Instant</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1">
                Funds reflect fast
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg sm:rounded-2xl p-3 sm:p-4 text-center shadow-sm">
              <div className="text-base sm:text-lg mb-1">🔒</div>
              <p className="font-semibold text-xs sm:text-[13px] text-foreground">Secure</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1">
                Bank-level safety
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg sm:rounded-2xl p-3 sm:p-4 text-center shadow-sm flex flex-col items-center">
              <div className="mb-1 flex justify-center text-foreground">
                <CiCreditCard1 size={25} />
              </div>

              <p className="font-semibold text-xs sm:text-[13px] text-foreground">
                Dual Payment
              </p>

              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1">
                Bank & Crypto
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
