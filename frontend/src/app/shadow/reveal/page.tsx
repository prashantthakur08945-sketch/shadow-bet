"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, ArrowRight, Skull } from 'lucide-react';

export default function ShadowRevealPage() {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCard(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 overflow-hidden">
      {!showCard ? (
        <div className="flex flex-col items-center space-y-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1.5 }}
            className="w-32 h-32 bg-primary rounded-full flex items-center justify-center glow-primary"
          >
            <Skull size={60} className="text-white" />
          </motion.div>
          <motion.h1 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl font-bold shadow-font text-primary-glow uppercase tracking-[0.5em]"
          >
            Unmasking...
          </motion.h1>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Shadow Card Component */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[32px] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass p-8 rounded-[30px] flex flex-col items-center text-center space-y-6">
              <div className="w-full flex justify-between items-start">
                <span className="text-xs font-mono text-primary-glow">ID: SHADOW_01_BETA</span>
                <span className="bg-primary/20 text-primary-glow text-[10px] px-2 py-0.5 rounded uppercase font-bold">Evolution 1</span>
              </div>

              <div className="w-24 h-24 bg-surface-2 rounded-2xl flex items-center justify-center border border-primary/30">
                 <Skull size={48} className="text-primary-glow" />
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-bold shadow-font text-white uppercase tracking-tight">VoidHeart</h2>
                <p className="text-accent font-medium italic">"Your digital twin but with better taste and no soul."</p>
              </div>

              <div className="w-full grid grid-cols-3 gap-2">
                {['CHAOTIC', 'CREATIVE', 'TOXIC'].map(trait => (
                  <div key={trait} className="bg-surface-2 border border-border py-2 rounded-lg text-[10px] font-bold text-text-muted">
                    {trait}
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-border my-2" />

              <div className="w-full text-left space-y-1">
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Shadow Career</p>
                <p className="text-sm text-white">Unemployed Philosophy major in a recursive loop.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button className="flex-1 bg-surface-2 border border-border hover:border-primary transition-all p-4 rounded-2xl flex items-center justify-center gap-2 text-white font-bold">
              <Share2 size={20} /> Share
            </button>
            <button 
              onClick={() => window.location.href = '/feed'}
              className="flex-1 bg-primary hover:bg-primary-glow transition-all p-4 rounded-2xl flex items-center justify-center gap-2 text-white font-bold glow-primary"
            >
              Enter Feed <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </main>
  );
}
