"use client";

import { useState, useEffect } from 'react';
import DareCard from '@/components/DareCard';
import { Flame, TrendingUp, Compass, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function FeedPage() {
  const [dares, setDares] = useState<any[]>([]);
  const [activeNiche, setActiveNiche] = useState('All');
  const [isTrending, setIsTrending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  const niches = ['All', 'Startup Bro', 'Creative Chaos', 'Rizz Lab', 'Gains Gang'];

  useEffect(() => {
    fetchDares();
  }, [activeNiche, isTrending]);

  async function fetchDares() {
    setLoading(true);
    try {
      let query = supabase
        .from('dares')
        .select(`
          *,
          creator:users!dares_creator_id_fkey(username, avatar_url),
          niche:niches(name, emoji)
        `)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString());

      if (activeNiche !== 'All') {
        query = query.eq('niche.name', activeNiche);
      }

      if (isTrending) {
        // Simple trending: sort by pot_amount. 
        // Real trending would involve bets count in last 60m.
        query = query.order('pot_amount', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setDares(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredDares = dares.filter(dare => {
    const searchLower = searchQuery.toLowerCase();
    return (
      dare.title.toLowerCase().includes(searchLower) ||
      dare.niche?.name?.toLowerCase().includes(searchLower) ||
      dare.creator?.username?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <main className="min-h-screen bg-bg pb-32">
      {/* Dynamic Header */}
      <div className="sticky top-0 z-30 glass border-b border-border px-4 py-4 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-black italic tracking-tighter text-text-primary">
              {isTrending ? 'TRENDING NOW' : 'SHADOW FEED'}
            </h1>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setIsTrending(!isTrending)}
                className={`transition-all ${isTrending ? 'text-primary-glow scale-125' : 'text-text-muted hover:text-text-primary'}`}
              >
                <Flame size={20} />
              </button>
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${showSearch ? 'bg-primary text-text-on-primary' : 'bg-surface border border-border text-text-muted hover:text-text-primary'}`}
              >
                {showSearch ? <X size={16} /> : <Search size={16} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search by title, niche, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-primary outline-none transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-8 mt-4">
        {/* Interactive Niche Scroller */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {niches.map(n => (
            <button 
              key={n} 
              onClick={() => setActiveNiche(n)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full border text-xs font-bold transition-all ${
                activeNiche === n 
                ? 'bg-primary border-primary text-text-on-primary shadow-glow-sm' 
                : 'bg-surface border-border text-text-muted hover:border-text-muted'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Dare Feed with Animations */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center animate-pulse">
              <p className="text-text-muted font-black tracking-widest italic">SUMMONING SHADOWS...</p>
            </div>
          ) : (
            <AnimatePresence mode='popLayout'>
              {filteredDares.map((dare, index) => (
                <motion.div
                  key={dare.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DareCard dare={dare} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {!loading && filteredDares.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <Compass size={48} className="mx-auto text-text-muted opacity-20" />
              <p className="text-text-muted font-medium">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

