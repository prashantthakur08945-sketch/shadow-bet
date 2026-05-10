"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Crown } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass rounded-[32px] border-primary/30 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-primary p-8 text-center space-y-2 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
               <Crown className="mx-auto text-white mb-2" size={48} />
               <h2 className="text-3xl font-bold shadow-font text-white uppercase tracking-tight">SHADOW+</h2>
               <p className="text-primary-glow font-bold">Unleash Full Chaos for ₹39/mo</p>
            </div>

            {/* Features */}
            <div className="p-8 space-y-6 bg-surface">
              <ul className="space-y-4">
                {[
                  "Unlimited Shadow Roast Chat",
                  "Weekly Shadow Evolution (Rare Traits)",
                  "Post Custom Community Dares",
                  "Bet & Earn from Dare Pots",
                  "Verified Shadow Badge"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white">
                    <div className="bg-success/20 p-1 rounded-full text-success">
                      <Check size={14} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className="w-full bg-primary hover:bg-primary-glow text-white font-bold py-4 rounded-2xl transition-all glow-primary flex items-center justify-center gap-2">
                UPGRADE NOW <Zap size={20} />
              </button>

              <button 
                onClick={onClose}
                className="w-full text-text-muted hover:text-white text-xs transition-colors"
              >
                Maybe later, I'm boring.
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
