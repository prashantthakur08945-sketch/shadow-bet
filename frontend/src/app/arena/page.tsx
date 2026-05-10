"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function ArenaCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('social');
  const [pot, setPot] = useState('');
  const [niches, setNiches] = useState<any[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNiches();
  }, []);

  async function fetchNiches() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('niches').select('*').order('name');
      
      if (data && data.length > 0) {
        setNiches(data);
        setSelectedNiche(data[0].id);
      }
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleRelease = async () => {
    if (!title || !pot || !selectedNiche) {
      setError('Please fill in all fields.');
      return;
    }

    if (parseInt(pot) < 100) {
      setError('Minimum pot amount is ₹100.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signup');
        return;
      }

      const potInPaise = parseInt(pot) * 100;

      const { error: dareError } = await supabase
        .from('dares')
        .insert({
          creator_id: user.id,
          niche_id: selectedNiche,
          title: title,
          category: category.toLowerCase(),
          pot_amount: potInPaise,
          status: 'active',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (dareError) throw dareError;

      alert('Challenge Released to the Feed! 💀');
      router.push('/feed');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-bg pt-8 pb-32 px-4 overflow-y-auto">
      <div className="max-w-md mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center text-primary shadow-glow mx-auto mb-6">
            <Zap size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-text-primary">
            Summon a Bet
          </h1>
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest">Challenge the community. Set the stakes.</p>
        </div>

        <div className="bg-surface border border-border rounded-3xl p-6 shadow-2xl relative overflow-hidden group transition-all">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
          
          <div className="space-y-6 relative z-10">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">What is the Dare?</label>
              <textarea 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Call your ex and ask for a recipe..."
                className="w-full bg-surface-2 border border-border rounded-xl p-4 focus:border-primary transition-all outline-none resize-none h-32 text-text-primary font-medium shadow-inner"
              />
            </div>

            {/* Niche & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Niche</label>
                <select 
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl p-3 text-xs font-bold text-text-primary outline-none focus:border-primary"
                >
                  {niches.map(n => <option key={n.id} value={n.id}>{n.emoji} {n.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl p-3 text-xs font-bold text-text-primary outline-none focus:border-primary"
                >
                  <option value="social">Social</option>
                  <option value="creative">Creative</option>
                  <option value="unhinged">Unhinged</option>
                  <option value="physical">Physical</option>
                </select>
              </div>
            </div>

            {/* Pot Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Initial Pot (₹)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={pot}
                  onChange={(e) => setPot(e.target.value)}
                  placeholder="500"
                  className="w-full bg-surface-2 border border-border rounded-xl p-4 pl-12 focus:border-primary transition-all outline-none text-xl font-black text-text-primary shadow-inner"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-glow text-xl font-black italic">₹</span>
              </div>
              <p className="text-[10px] text-text-muted px-1 italic font-bold">Min. amount: ₹100. Platform takes 5% fee.</p>
            </div>

            {error && <p className="text-danger text-xs font-bold bg-danger/10 p-3 rounded-lg border border-danger/20">{error}</p>}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={handleRelease}
              className="w-full py-4 rounded-xl bg-primary hover:bg-primary-glow text-text-on-primary font-black italic tracking-widest uppercase text-sm shadow-glow flex items-center justify-center gap-2 group disabled:opacity-50 transition-all mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <span>RELEASE TO FEED</span>
                  <Flame size={18} className="group-hover:animate-bounce text-warning" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </main>
  );
}
