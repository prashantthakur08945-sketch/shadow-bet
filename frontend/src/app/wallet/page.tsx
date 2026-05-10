"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, ArrowUpRight, History, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PRESET_AMOUNTS = [100, 200, 500, 1000];

const TEST_USER_ID = '6a634726-babe-465b-907d-7f44a8735806'; // Real Test God in this DB

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserAndBalance();
    
    // Subscribe to wallet updates
    const channel = supabase
      .channel('wallet_updates')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'wallets' 
      }, (payload: any) => {
        if (user && payload.new.user_id === user.id) {
          setBalance(payload.new.balance_paise);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  async function fetchUserAndBalance() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setUser(authUser);
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance_paise')
          .eq('user_id', authUser.id)
          .single();

        if (wallet) {
          setBalance(wallet.balance_paise);
        } else {
          setBalance(0);
        }
      } else {
        // TEST MODE: Fallback
        setUser({ id: TEST_USER_ID, email: 'testgod@shadow.bet' });
        setBalance(1000000); // ₹10,000
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }

  const handleTopUp = async () => {
    const amountInPaise = parseInt(amount) * 100;
    if (isNaN(amountInPaise) || amountInPaise < 1000) {
      setError('Minimum top-up is ₹10');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Create Order on Backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_paise: amountInPaise, userId: user.id })
      });

      const orderData = await res.json();
      if (orderData.error) throw new Error(orderData.error);

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Shadow Bet',
        description: 'Wallet Top-Up',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment on Backend
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                userId: user.id,
                amount_paise: amountInPaise
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccess(`Successfully added ₹${parseInt(amount)} to your wallet! 💀`);
              setAmount('');
              setBalance(verifyData.balance);
            } else {
              throw new Error(verifyData.error || 'Verification failed');
            }
          } catch (err: any) {
            setError(err.message);
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#7C3AED',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg pt-8 pb-32 px-4">
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center text-primary shadow-glow mb-2">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Shadow Wallet</h1>
          <p className="text-text-muted text-sm uppercase tracking-widest font-medium">Digital War Chest</p>
        </div>

        {/* Balance Card */}
        <div className="glass p-8 rounded-[32px] border-primary/20 relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard size={120} />
          </div>
          <span className="text-text-muted text-xs uppercase tracking-widest font-bold mb-1">Available Balance</span>
          {fetching ? (
            <Loader2 className="animate-spin text-primary mt-2" size={32} />
          ) : (
            <h2 className="text-5xl font-black text-text-primary italic tracking-tighter">
              ₹{(balance || 0) / 100}
            </h2>
          )}
        </div>

        {/* Top Up Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Top Up Amount (₹)</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className={`py-3 rounded-xl border font-bold transition-all ${
                    amount === amt.toString() 
                      ? 'bg-primary border-primary text-text-on-primary shadow-glow' 
                      : 'bg-surface border-border text-text-muted hover:border-text-muted'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom Amount"
                className="w-full bg-surface border border-border rounded-xl p-4 pl-12 focus:border-primary outline-none text-xl font-bold text-text-primary transition-all shadow-inner"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₹</span>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl text-success text-sm font-medium">
              <CheckCircle2 size={18} />
              {success}
            </motion.div>
          )}

          <button
            disabled={loading || !amount}
            onClick={handleTopUp}
            className="w-full py-4 rounded-xl bg-primary hover:bg-primary-glow text-text-on-primary font-bold tracking-widest uppercase text-sm shadow-glow flex items-center justify-center gap-2 group disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <span>ADD MONEY</span>
                <ArrowUpRight size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Transaction History Placeholder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">History</h3>
            <History size={16} className="text-text-muted" />
          </div>
          <div className="glass rounded-2xl border-border p-8 text-center">
            <p className="text-text-muted text-sm italic">"Money is just paper. Influence is eternal."</p>
            <p className="text-[10px] text-text-muted/50 uppercase tracking-widest mt-2 font-bold">No transactions yet</p>
          </div>
        </div>
      </div>
    </main>
  );
}
