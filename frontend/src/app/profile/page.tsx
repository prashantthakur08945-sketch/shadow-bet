"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Zap, History, Settings, ArrowRight, LogOut, Lock, Bell, CreditCard, ChevronRight, X, Trophy, Skull } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const supabase = createClient();
const TEST_USER_ID = '6a634726-babe-465b-907d-7f44a8735806';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [shadow, setShadow] = useState<any>(null);
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const userId = authUser?.id || TEST_USER_ID;

      // Fetch User
      const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single();
      setUser(userData);

      // Fetch Shadow
      const { data: shadowData } = await supabase.from('shadows').select('*').eq('user_id', userId).single();
      setShadow(shadowData);

      // Fetch Bets
      const { data: betData } = await supabase
        .from('dare_bets')
        .select('*, dares(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setBets(betData || []);

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-primary">
          <Skull size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg pt-12 pb-32 px-4">
      <div className="max-w-md mx-auto space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-1 shadow-glow animate-gradient">
              <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden border-4 border-bg">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <User size={56} className="text-text-muted" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary p-2 rounded-2xl border-4 border-bg shadow-2xl">
              <Shield size={18} className="text-text-on-primary" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-text-primary">@{user?.username || 'shadow_ghost'}</h1>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">{user?.plan === 'shadow_plus' ? 'Shadow Plus Member' : 'Free Tier Arena'}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-6 rounded-[32px] border-border flex flex-col items-center justify-center space-y-1">
            <span className="text-primary-glow text-3xl font-black italic">14</span>
            <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">Dares Won</span>
          </div>
          <div className="glass p-6 rounded-[32px] border-border flex flex-col items-center justify-center space-y-1">
            <span className="text-success text-3xl font-black italic">₹{(user?.wallet_balance || 0) / 100}</span>
            <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">Balance</span>
          </div>
        </div>

        {/* Shadow Card Preview */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Active Shadow</h2>
            <button onClick={() => router.push('/shadow')} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">Manage <ArrowRight size={12} /></button>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative glass p-6 rounded-[32px] border-primary/20 space-y-4 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                <Zap size={64} className="text-primary" />
              </div>
              <div className="relative z-10 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black italic text-text-primary uppercase tracking-tighter">{shadow?.name || 'VoidHeart'}</h3>
                    <p className="text-primary text-[9px] font-black uppercase tracking-widest">{shadow?.archetype || 'The Architect'}</p>
                  </div>
                  <div className="bg-primary/20 text-primary-glow px-2 py-0.5 rounded text-[8px] font-black uppercase border border-primary/30">Lvl {shadow?.evolution_stage || 1}</div>
                </div>
                <p className="text-xs text-text-muted leading-relaxed italic font-medium">
                  "{shadow?.career || 'A cold, calculated entity that treats LinkedIn like a gladiator pit.'}"
                </p>
                <div className="flex gap-2">
                  {shadow?.personality?.traits?.slice(0, 2).map((t: string) => (
                    <span key={t} className="text-[8px] bg-bg px-2 py-1 rounded-lg border border-border text-text-muted font-black uppercase tracking-widest">#{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={() => setShowHistory(true)}
            className="w-full glass p-5 rounded-2xl border-border flex items-center justify-between group hover:border-primary transition-all active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-text-on-primary transition-all">
                <History size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black italic text-text-primary uppercase tracking-tight">Betting History</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{bets.length} recent stakes</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-text-muted group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className="w-full glass p-5 rounded-2xl border-border flex items-center justify-between group hover:border-text-muted transition-all active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-surface-2 rounded-xl flex items-center justify-center text-text-muted border border-border group-hover:bg-text-primary group-hover:text-bg transition-all">
                <Settings size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black italic text-text-primary uppercase tracking-tight">Settings & Privacy</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Preferences & Security</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-text-muted group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Betting History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-md glass rounded-[40px] border-border overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-text-primary">Betting History</h3>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="max-h-[500px] overflow-y-auto p-4 space-y-3 no-scrollbar">
                {bets.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <History size={48} className="mx-auto mb-4" />
                    <p className="text-sm font-black italic uppercase">No bets found in the void.</p>
                  </div>
                ) : (
                  bets.map((bet) => (
                    <div key={bet.id} className="bg-white/5 border border-border p-4 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                          <Trophy size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black italic text-text-primary uppercase truncate max-w-[150px]">{bet.dares?.title || 'Unknown Dare'}</p>
                          <p className="text-[10px] text-text-muted font-bold uppercase">{new Date(bet.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-success font-black italic">₹{bet.amount / 100}</p>
                        <p className="text-[8px] text-text-muted font-black uppercase tracking-widest">STAKED</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-md glass rounded-[40px] border-border overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-text-primary">Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <Bell size={20} className="text-text-muted" />
                      <span className="text-sm font-black italic uppercase tracking-tight text-text-primary">Push Notifications</span>
                    </div>
                    <div className="w-10 h-5 bg-primary rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <Lock size={20} className="text-text-muted" />
                      <span className="text-sm font-black italic uppercase tracking-tight text-text-primary">Privacy Mode</span>
                    </div>
                    <div className="w-10 h-5 bg-surface-2 rounded-full relative">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-text-muted rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className="text-text-muted" />
                      <span className="text-sm font-black italic uppercase tracking-tight text-text-primary">Payment Methods</span>
                    </div>
                    <ChevronRight size={16} className="text-text-muted" />
                  </div>
                </div>

                <div className="h-px bg-border mx-2" />

                <button 
                  onClick={handleLogout}
                  className="w-full p-4 rounded-2xl bg-danger/10 text-danger border border-danger/20 flex items-center justify-center gap-2 font-black italic uppercase tracking-widest hover:bg-danger hover:text-white transition-all shadow-glow-danger"
                >
                  <LogOut size={18} /> End Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

