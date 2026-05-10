"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquare, Sword, User, Wallet, Plus, ArrowLeft, Sun, Moon, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const navItems = [
  { icon: Home, label: 'Feed', href: '/feed' },
  { icon: MessageSquare, label: 'Chat', href: '/chat' },
  { icon: Sword, label: 'Shadow', href: '/shadow' },
  { icon: User, label: 'Profile', href: '/profile' },
];

const BG_COLORS = [
  { name: 'Deep Black', color: '#0D0D0D' },
  { name: 'Midnight', color: '#1A1A2E' },
  { name: 'Slate', color: '#1e293b' },
  { name: 'Cyber', color: '#0f172a' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    fetchBalance();
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLightTheme(true);
      document.body.classList.add('light-theme');
    }

    const savedBg = localStorage.getItem('bg-color');
    if (savedBg) {
      document.documentElement.style.setProperty('--bg', savedBg);
    }
    
    // Realtime Wallet Subscription
    const channel = supabase
      .channel('nav_wallet')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wallets' }, (payload) => {
        setBalance(payload.new.balance_paise);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleTheme = () => {
    const newVal = !isLightTheme;
    setIsLightTheme(newVal);
    if (newVal) {
      document.body.classList.add('light-theme');
      document.documentElement.style.removeProperty('--bg');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      const savedBg = localStorage.getItem('bg-color');
      if (savedBg) {
        document.documentElement.style.setProperty('--bg', savedBg);
      }
      localStorage.setItem('theme', 'dark');
    }
  };

  const changeBg = (color: string) => {
    setIsLightTheme(false);
    document.body.classList.remove('light-theme');
    document.documentElement.style.setProperty('--bg', color);
    localStorage.setItem('bg-color', color);
    localStorage.setItem('theme', 'dark');
  };

  async function fetchBalance() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let { data } = await supabase.from('wallets').select('balance_paise').eq('user_id', user.id).single();
      
      if (!data) {
        // AUTO-PROVISION for testing
        const { data: newWallet, error } = await supabase
          .from('wallets')
          .insert({ user_id: user.id, balance_paise: 1000000 })
          .select()
          .single();
        if (newWallet) setBalance(newWallet.balance_paise);
      } else {
        setBalance(data.balance_paise);
      }
    } else {
      // TEST MODE Fallback
      setBalance(1000000); // ₹10,000
    }
  }

  // Hide nav on landing, auth, onboarding and reveal pages
  if (pathname === '/' || pathname.includes('/auth') || pathname.includes('/onboarding') || pathname.includes('/reveal')) return null;

  return (
    <>
      {/* Top-Level Controls */}
      <div className="fixed top-6 left-6 right-6 z-[60] flex items-center justify-between pointer-events-none">
        {/* Back Button - top left */}
        <div className="pointer-events-auto">
          {pathname !== '/feed' && (
            <button 
              onClick={() => router.back()}
              className="glass w-12 h-12 rounded-2xl border-white/5 flex items-center justify-center text-text-primary hover:border-primary transition-all group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Sleek Create Dare Button - top right */}
        <Link href="/dares/create" className="pointer-events-auto bg-primary hover:bg-primary-glow h-12 px-5 rounded-2xl transition-all shadow-glow flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-on-primary italic">Create Dare</span>
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <Plus size={14} className="text-text-on-primary" />
          </div>
        </Link>
      </div>

      {/* Bottom-Right Theme Toggle */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence>
          {showThemeMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="glass p-3 rounded-3xl border-white/10 flex flex-col gap-2 pointer-events-auto mb-2"
            >
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors text-sm font-bold text-text-primary"
              >
                {isLightTheme ? <Moon size={16} /> : <Sun size={16} />}
                {isLightTheme ? 'Dark Mode' : 'Light Mode'}
              </button>
              <div className="h-px bg-white/10 mx-2" />
              <div className="flex gap-2 p-1">
                {BG_COLORS.map((c) => (
                  <button 
                    key={c.color}
                    onClick={() => changeBg(c.color)}
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setShowThemeMenu(!showThemeMenu)}
          className="glass w-12 h-12 rounded-2xl border-white/5 flex items-center justify-center text-text-primary hover:border-primary transition-all pointer-events-auto shadow-2xl"
        >
          <Palette size={20} className={showThemeMenu ? 'text-primary' : ''} />
        </button>
      </div>

      {/* Bottom-Left Wallet */}
      <div className="fixed bottom-6 left-6 z-[60] pointer-events-auto">
        <Link href="/wallet" className="glass h-12 px-4 rounded-2xl border-border hover:border-primary transition-all flex items-center gap-3 shadow-2xl">
          <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
            <Wallet size={14} className="text-primary" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Balance</span>
            <span className="text-sm font-black italic text-text-primary">₹{(balance || 0) / 100}</span>
          </div>
        </Link>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 flex flex-col items-center gap-3">
        <div className="glass rounded-[32px] px-6 py-3 border-primary/20 flex items-center gap-8 shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative group">
              <div className={`p-2 transition-colors ${isActive ? 'text-primary-glow' : 'text-text-muted hover:text-text-primary'}`}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute -inset-2 bg-primary/20 blur-md rounded-full -z-10"
                />
              )}
            </Link>
          );
        })}
      </div>
      </nav>
    </>
  );
}
