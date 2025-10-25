"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Coins, ArrowUpRight, ArrowDownLeft, Plus, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  amount: number;
  reason: string | null;
  createdAt: string;
}

interface CreditStats {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export default function CreditsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<CreditStats>({ balance: 0, totalEarned: 0, totalSpent: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferData, setTransferData] = useState({ recipientEmail: "", amount: "" });
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchCredits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/credits");
      if (!response.ok) throw new Error("Failed to fetch credits");

      const data = await response.json();
      setStats({
        balance: data.balance,
        totalEarned: data.stats?.totalEarned || 0,
        totalSpent: data.stats?.totalSpent || 0,
      });
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transferData.recipientEmail || !transferData.amount) {
      alert("Please fill all fields");
      return;
    }

    const amount = Number(transferData.amount);
    if (amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    if (amount > stats.balance) {
      alert("Insufficient balance");
      return;
    }

    setTransferring(true);
    try {
      const response = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transfer",
          recipientEmail: transferData.recipientEmail,
          amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Transfer failed");
      }

      setTransferDialogOpen(false);
      setTransferData({ recipientEmail: "", amount: "" });
      fetchCredits();
      alert("Transfer successful!");
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Credits Wallet</h1>
          <p className="text-muted-foreground">
            Manage your credits, transfer to others, or purchase more
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.balance}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Available credits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalEarned}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.totalSpent}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time spending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Transfer Credits
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer Credits</DialogTitle>
                <DialogDescription>
                  Send credits to another user by their email address
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleTransfer}>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="email">Recipient Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={transferData.recipientEmail}
                      onChange={(e) =>
                        setTransferData({ ...transferData, recipientEmail: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      required
                      min={1}
                      max={stats.balance}
                      placeholder="0"
                      value={transferData.amount}
                      onChange={(e) =>
                        setTransferData({ ...transferData, amount: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Available: {stats.balance} credits
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={transferring}>
                    {transferring ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Transfer
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Buy Credits (Coming Soon)
          </Button>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Your recent credit transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.amount > 0 ? (
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <ArrowDownLeft className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {transaction.reason || "Transaction"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={transaction.amount > 0 ? "default" : "secondary"}>
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
