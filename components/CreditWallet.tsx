'use client';

import Link from 'next/link';
import { Wallet, Plus } from 'lucide-react';

interface CreditWalletProps {
  balance: number;
}

export function CreditWallet({ balance }: CreditWalletProps) {
  return (
    <Link
      href="/credits"
      className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="w-8 h-8" />
          <div>
            <p className="text-indigo-100 text-sm">Credit Balance</p>
            <p className="text-3xl font-bold">{balance}</p>
          </div>
        </div>
        <div className="bg-white/20 rounded-full p-2">
          <Plus className="w-6 h-6" />
        </div>
      </div>
      <p className="text-indigo-100 text-sm mt-4">Click to purchase more credits</p>
    </Link>
  );
}
