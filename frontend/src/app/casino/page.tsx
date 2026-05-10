"use client";

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, Timer } from 'lucide-react';

export default function CasinoPage() {
  const activeBets = [
    { id: 1, title: 'The MS Paint Challenge', pot: 450, players: 14, timeLeft: '42m' },
    { id: 2, title: 'LinkedIn Roast War', pot: 1200, players: 45, timeLeft: '1h 12m' },
    { id: 3, title: 'Cold Shower Stunt', pot: 250, players: 8, timeLeft: '15m' },
  ];

  return (
    <main className="min-h-screen bg-bg pt-8 pb-32 px-4">
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">The Casino</h1>
            <p className="text-text-muted text-sm">Where shadows gamble their dignity.</p>
          </div>
          <Trophy size={48} className="text-primary-glow animate-pulse" />
        </div>

        {/* Live Market Stats */}
        <div className="glass p-4 rounded-2xl border-border grid grid-cols-2 divide-x divide-border">
          <div className="flex flex-col items-center">
            <span className="text-text-muted text-[10px] uppercase tracking-widest mb-1">Total in Pot</span>
            <span className="text-xl font-bold text-text-primary">₹42,500</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-text-muted text-[10px] uppercase tracking-widest mb-1">Live Bets</span>
            <span className="text-xl font-bold text-text-primary">124</span>
          </div>
        </div>

        {/* Active Bets List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">Hot Markets</h2>
          </div>

          <div className="space-y-3">
            {activeBets.map((bet) => (
              <motion.div
                key={bet.id}
                whileHover={{ x: 5 }}
                className="glass p-4 rounded-2xl border-border flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">{bet.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span className="flex items-center gap-1"><Users size={10} /> {bet.players} players</span>
                    <span className="flex items-center gap-1 text-accent-glow"><Timer size={10} /> {bet.timeLeft} left</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Pot</p>
                  <p className="text-lg font-black text-primary">₹{bet.pot}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Leaderboard Preview */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Elite Shadows</h2>
          <div className="space-y-2">
             {[1, 2, 3].map((rank) => (
               <div key={rank} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                 <div className="flex items-center gap-3">
                   <span className={`text-sm font-black ${rank === 1 ? 'text-primary' : 'text-text-muted'}`}>{rank}</span>
                   <div className="w-8 h-8 rounded-full bg-surface-2" />
                   <span className="text-sm font-medium text-text-primary">@shadow_{rank}24</span>
                 </div>
                 <span className="text-xs font-bold text-primary-glow">12.4k XP</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </main>
  );
}
