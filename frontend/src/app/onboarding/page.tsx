"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, Zap } from 'lucide-react';

const questions = [
  {
    id: 1,
    q: "Your alarm goes off at 6:00 AM. What's your move?",
    options: [
      { text: "Delete the app. I don't follow rules.", val: "rebel" },
      { text: "Snooze for 2 hours. Life is a suggestion.", val: "procrastinator" },
      { text: "Stare at the ceiling and contemplate the void.", val: "existential" },
      { text: "Gym. To outrun my demons.", val: "driven" }
    ]
  },
  {
    id: 2,
    q: "A heated argument breaks out in the group chat. You:",
    options: [
      { text: "Drop a 'yikes' and mute for a year.", val: "detached" },
      { text: "Send a screenshot to the person they're talking about.", val: "chaos" },
      { text: "Fuel the fire with a controversial meme.", val: "instigator" },
      { text: "Type a 5-paragraph essay on why everyone is wrong.", val: "intellectual" }
    ]
  }
  // ... more questions will be added
];

export default function OnboardingPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAnswer = (val: string) => {
    setAnswers({ ...answers, [questions[currentIdx].id]: val });
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsGenerating(true);
    // Simulate generation for now
    setTimeout(() => {
      window.location.href = '/shadow/reveal';
    }, 3000);
  };

  if (isGenerating) {
    return (
      <main className="min-h-screen bg-bg flex flex-col items-center justify-center p-8 text-center space-y-8">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            filter: ["blur(0px)", "blur(10px)", "blur(0px)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 bg-primary rounded-full glow-primary flex items-center justify-center"
        >
          <Zap size={40} className="text-white" />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold shadow-font text-white">Synthesizing Your Shadow</h1>
          <p className="text-primary-glow animate-pulse">Consulting the dark web for your digital sins...</p>
        </div>
      </main>
    );
  }

  const currentQ = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center pt-12 pb-32 px-4 overflow-y-auto relative">
      <div className="w-full max-w-xl space-y-12">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 text-primary">
              <BrainCircuit />
              <span className="font-mono text-sm uppercase tracking-tighter">Psychological Audit {currentIdx + 1}/{questions.length}</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold shadow-font leading-tight">
              {currentQ.q}
            </h2>

            <div className="grid gap-4">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.val)}
                  className="group relative p-6 text-left glass rounded-2xl hover:border-primary transition-all active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <span className="text-xl group-hover:text-primary-glow transition-colors">{opt.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
