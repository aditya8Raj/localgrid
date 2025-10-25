'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Wallet, CreditCard, TrendingUp, Loader2, CheckCircle } from 'lucide-react';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CREDIT_PACKAGES = [
  { credits: 100, priceINR: 100, label: '100 Credits' },
  { credits: 500, priceINR: 450, label: '500 Credits', discount: '10% off' },
  { credits: 1000, priceINR: 800, label: '1000 Credits', discount: '20% off' },
  { credits: 5000, priceINR: 3500, label: '5000 Credits', discount: '30% off' },
];

interface Transaction {
  id: string;
  amount: number;
  reason: string | null;
  createdAt: string;
}

export default function CreditsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/credits/transactions');
      const data = await response.json();

      if (response.ok) {
        setBalance(data.balance);
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (credits: number, priceINR: number) => {
    setPurchasing(true);
    setError(null);

    try {
      // Create Razorpay order
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create order');
        setPurchasing(false);
        return;
      }

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'LocalGrid Credits',
        description: `Purchase ${credits} credits`,
        order_id: data.order.id,
        prefill: {
          name: data.user.name,
          email: data.user.email,
        },
        theme: {
          color: '#4F46E5',
        },
        handler: async (response: any) => {
          // Verify payment
          try {
            const verifyResponse = await fetch('/api/credits/purchase', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              alert(verifyData.message);
              fetchTransactions(); // Refresh balance and transactions
            } else {
              setError(verifyData.error || 'Payment verification failed');
            }
          } catch (err) {
            setError('Payment verification failed');
            console.error('Verify payment error:', err);
          } finally {
            setPurchasing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPurchasing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError('Failed to initiate payment');
      console.error('Purchase error:', err);
      setPurchasing(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Credits</h1>
            <p className="text-gray-600">Manage your LocalGrid credits and purchase more</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Current Balance */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 text-white">
              <Wallet className="w-12 h-12" />
              <div>
                <p className="text-indigo-100 text-sm">Current Balance</p>
                <p className="text-4xl font-bold">{balance} Credits</p>
              </div>
            </div>
          </div>

          {/* Credit Packages */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Purchase Credits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <div
                  key={pkg.credits}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-500 transition-colors relative"
                >
                  {pkg.discount && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {pkg.discount}
                    </span>
                  )}
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 mb-2">{pkg.credits}</p>
                    <p className="text-gray-600 mb-4">Credits</p>
                    <p className="text-2xl font-bold text-indigo-600 mb-4">
                      ₹{pkg.priceINR}
                    </p>
                    <button
                      onClick={() => handlePurchase(pkg.credits, pkg.priceINR)}
                      disabled={purchasing}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchasing ? 'Processing...' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-6 text-center">
              Payments processed securely via Razorpay • INR prices include all taxes
            </p>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Transaction History
            </h2>

            {transactions.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.amount > 0 ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.reason || 'Transaction'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-lg font-bold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount} credits
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
