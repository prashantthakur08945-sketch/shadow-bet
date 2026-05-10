"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Flame, Shield, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden selection:bg-primary selection:text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        {/* Hero Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-primary-glow mb-8"
        >
          <Flame size={14} />
          THE SOCIAL CHAOS EXPERIMENT
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black tracking-tighter italic mb-8 leading-[0.9] shadow-glow-text"
        >
          EMBRACE YOUR <br />
          <span className="text-primary italic">SHADOW</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-xl text-lg text-text-muted mb-12 leading-relaxed"
        >
          The only social platform where you bet on your own potential. Summon your AI Shadow, complete dares, and win real stakes.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center w-full max-w-md"
        >
          <Link href="/auth/signup" className="w-full">
            <button className="w-full py-5 rounded-[24px] bg-primary text-white font-black text-lg shadow-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 group">
              GET STARTED <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-32 w-full max-w-4xl">
          {[
            { icon: Zap, title: "AI PERSONA", desc: "Synthesize an evil twin that knows you better than you know yourself." },
            { icon: Flame, title: "REAL STAKES", desc: "Winner takes the pot. No fake likes, just real rewards." }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (i * 0.1) }}
              className="glass p-8 rounded-[32px] border-white/5 text-left"
            >
              <feature.icon size={32} className="text-primary mb-6" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}
