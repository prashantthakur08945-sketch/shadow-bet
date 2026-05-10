"use client";

import { motion } from 'framer-motion';
import { Plus, Sparkles, Send, Flame, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function CreateDarePage() {
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
      if (!user) {
        console.warn('User not authenticated, skipping niche creation');
        return;
      }

      const { data, error } = await supabase.from('niches').select('*').order('name');
      
      if (data && data.length > 0) {
        setNiches(data);
        setSelectedNiche(data[0].id);
      } else {
        // Create a default niche if none exist
        const { data: newNiche, error: nicheError } = await supabase
          .from('niches')
          .insert({
            name: 'General Chaos',
            emoji: '🎲',
            color: '#6C2BD9',
            creator_id: user.id
          })
          .select()
          .single();
        
        if (nicheError) {
          console.error('Niche creation failed:', nicheError.message);
          // Fallback to local state if DB insert fails (e.g., due to RLS)
          const localNiche = { id: '00000000-0000-0000-0000-000000000000', name: 'General', emoji: '🎲' };
          setNiches([localNiche]);
          setSelectedNiche(localNiche.id);
        } else {
          setNiches([newNiche]);
          setSelectedNiche(newNiche.id);
        }
      }
    } catch (err: any) {
      console.error('Unexpected error in fetchNiches:', err.message || err);
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

      const { data, error: dareError } = await supabase
        .from('dares')
        .insert({
          creator_id: user.id,
          niche_id: selectedNiche,
          title: title,
          category: category.toLowerCase(),
          pot_amount: potInPaise,
          status: 'active',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })
        .select()
        .single();

      if (dareError) throw dareError;

      alert('Challenge Released! 💀');
      router.push('/feed');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg pt-8 pb-32 px-4 overflow-y-auto">
      <div className="max-w-md mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-text-primary">
            Summon a Dare
          </h1>
          <p className="text-text-muted text-sm">Challenge the community. Set the stakes.</p>
        </div>

        <div className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Challenge Title</label>
            <textarea 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call your ex and ask for a recipe for disaster..."
              className="w-full bg-surface border-2 border-border rounded-2xl p-4 focus:border-primary/50 transition-all outline-none resize-none h-32 text-lg font-medium text-text-primary"
            />
          </div>

          {/* Niche Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Target Niche</label>
            <div className="flex flex-wrap gap-2">
              {niches.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNiche(n.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    selectedNiche === n.id 
                      ? 'bg-primary border-primary text-text-on-primary shadow-glow' 
                      : 'bg-surface border-border text-text-muted hover:border-primary/50'
                  }`}
                >
                  {n.emoji} {n.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Category Type</label>
            <div className="flex flex-wrap gap-2">
              {['Social', 'Creative', 'Unhinged', 'Physical'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c.toLowerCase())}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    category === c.toLowerCase() 
                      ? 'bg-accent border-accent text-text-on-primary shadow-glow' 
                      : 'bg-surface border-border text-text-muted hover:border-accent/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Pot Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Initial Pot (₹)</label>
            <div className="relative">
              <input 
                type="number" 
                value={pot}
                onChange={(e) => setPot(e.target.value)}
                placeholder="500"
                className="w-full bg-surface border-2 border-border rounded-2xl p-4 pl-12 focus:border-primary/50 transition-all outline-none text-xl font-bold text-text-primary"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl font-bold">₹</span>
            </div>
            <p className="text-[10px] text-text-muted px-1 italic">Min. amount: ₹100. Platform takes 5% fee.</p>
          </div>

          {error && <p className="text-danger text-sm bg-danger/10 p-3 rounded-xl border border-danger/20">{error}</p>}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={handleRelease}
            className="w-full py-5 rounded-[24px] bg-gradient-to-r from-primary to-accent text-text-on-primary font-bold text-lg shadow-glow flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <span>RELEASE CHALLENGE</span>
                <Flame size={20} className="group-hover:animate-bounce" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </main>
  );
}

