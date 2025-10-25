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
      className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Credit Balance</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{balance}</p>
        </div>
        <div className="p-3 bg-indigo-100 rounded-lg">
          <Wallet className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-indigo-600 text-sm font-medium">
        <Plus className="w-4 h-4" />
        <span>Purchase Credits</span>
      </div>
    </Link>
  );
}
