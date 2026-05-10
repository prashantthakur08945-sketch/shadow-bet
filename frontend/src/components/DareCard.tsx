"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Users, Trophy, Flame, ChevronRight, IndianRupee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import UpgradeModal from './UpgradeModal';

const supabase = createClient();

interface DareCardProps {
  dare: {
    id: string;
    title: string;
    pot_amount: number;
    category: string;
    expires_at: string;
    creator: { username: string; avatar_url?: string };
    niche?: { name: string; emoji: string };
  };
}

export default function DareCard({ dare }: DareCardProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showBetSelector, setShowBetSelector] = useState(false);
  const [hasBet, setHasBet] = useState(false);
  const [loading, setLoading] = useState(false);

  const potInRupees = dare.pot_amount / 100;

  useEffect(() => {
    checkUserAndBets();
  }, []);

  async function checkUserAndBets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
      setUser(userData);

      // Check if user already bet on this dare
      const { data: bet } = await supabase
        .from('dare_bets')
        .select('*')
        .eq('dare_id', dare.id)
        .eq('user_id', user.id)
        .single();
      
      if (bet) setHasBet(true);
    }
  }

  const handleJoinBet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dares/${dare.id}`);
  };

  const placeBet = async (amount: number) => {
    setLoading(true);
    try {
      const amountInPaise = amount * 100;

      if (user.wallet_balance < amountInPaise) {
        alert("Insufficient balance! Go to profile to top up.");
        return;
      }

      // 1. Deduct balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({ wallet_balance: user.wallet_balance - amountInPaise })
        .eq('id', user.id);
      
      if (balanceError) throw balanceError;

      // 2. Insert bet
      const { error: betError } = await supabase
        .from('dare_bets')
        .insert({
          dare_id: dare.id,
          user_id: user.id,
          amount: amountInPaise
        });
      
      if (betError) throw betError;

      // 3. Update pot
      const { error: potError } = await supabase
        .from('dares')
        .update({ pot_amount: dare.pot_amount + amountInPaise })
        .eq('id', dare.id);
      
      if (potError) throw potError;

      setHasBet(true);
      setShowBetSelector(false);
      alert(`You're in. 💀 ₹${amount} added to pot.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => router.push(`/dares/${dare.id}`)}
        className="w-full glass rounded-[32px] overflow-hidden border-primary/20 flex flex-col cursor-pointer transition-shadow hover:shadow-glow-sm"
      >
        {/* Top Section */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-2 rounded-full border border-border flex items-center justify-center overflow-hidden">
                {dare.creator?.avatar_url ? (
                  <img src={dare.creator.avatar_url} alt={dare.creator.username} />
                ) : (
                  <span className="text-xs text-text-muted">
                    {dare.creator?.username ? dare.creator.username[0].toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">@{dare.creator?.username || 'unknown_shadow'}</p>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">{dare.niche?.emoji || '🎲'} {dare.niche?.name || 'General Chaos'}</p>
              </div>
            </div>
            <div className="bg-danger/20 text-danger text-[10px] px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 border border-danger/30">
              <Timer size={12} /> 42m LEFT
            </div>
          </div>

          <h3 className="text-2xl font-bold text-text-primary shadow-font leading-snug">
            {dare.title}
          </h3>

          <div className="flex gap-2">
            <span className="bg-surface-2 text-text-muted text-[10px] px-3 py-1 rounded-full border border-border uppercase font-bold">
              {dare.category}
            </span>
            <span className="bg-primary/10 text-primary-glow text-[10px] px-3 py-1 rounded-full border border-primary/20 uppercase font-bold">
              Medium Difficulty
            </span>
          </div>
        </div>

        {/* Bottom Section (Pot) */}
        <div className="bg-surface-2/50 p-6 flex justify-between items-center border-t border-border mt-auto">
          <div className="space-y-1">
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Current Pot</p>
            <p className="text-3xl font-bold text-success font-mono">₹{potInRupees}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-surface-2 border-2 border-bg flex items-center justify-center text-[8px] text-text-muted">
                  U{i}
                </div>
              ))}
              <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-bg flex items-center justify-center text-[8px] text-primary-glow font-bold">
                +12
              </div>
            </div>
            <button 
              onClick={handleJoinBet}
              disabled={hasBet || loading}
              className={`text-xs font-bold px-8 py-3 rounded-2xl transition-all active:scale-95 ${
                hasBet 
                ? 'bg-success/20 text-success border border-success/30 cursor-default' 
                : 'bg-primary hover:bg-primary-glow text-text-on-primary glow-primary'
              }`}
            >
              {hasBet ? 'BETTING' : loading ? '...' : 'JOIN BET'}
            </button>
          </div>
        </div>
      </motion.div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />

      <AnimatePresence>
        {showBetSelector && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-sm glass p-8 rounded-[32px] border-primary/20 space-y-6"
            >
              <div className="text-center space-y-2">
                <IndianRupee className="mx-auto text-primary" size={32} />
                <h2 className="text-2xl font-bold shadow-font">Place Your Bet</h2>
                <p className="text-text-muted text-sm">Choose an amount to add to the pot.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[10, 25, 50, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => placeBet(amount)}
                    className="py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-primary hover:border-primary transition-all font-bold text-lg"
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowBetSelector(false)}
                className="w-full text-text-muted text-xs font-bold uppercase tracking-widest hover:text-white pt-4"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

