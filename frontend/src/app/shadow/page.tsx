"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Zap, MessageSquare, Shield, Share2, 
  ArrowRight, Sparkles, Flame, History, Award, Send, Bot
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const supabase = createClient();
const TEST_USER_ID = '6a634726-babe-465b-907d-7f44a8735806';

export default function ShadowDashboard() {
  const router = useRouter();
  const [shadow, setShadow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchShadowData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchShadowData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || TEST_USER_ID;

      // Fetch Shadow
      const { data: shadowData } = await supabase
        .from('shadows')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (shadowData) {
        setShadow(shadowData);
      } else {
        // Fallback for demo
        setShadow({
          name: "VoidHeart",
          archetype: "The Cynic",
          evolution_stage: 1,
          personality: { traits: ["CHAOTIC", "CREATIVE", "TOXIC"], roast_level: 80 },
          xp: 250,
          career: "Unemployed Philosophy major in a recursive loop."
        });
      }

      // Fetch Chat History
      const { data: messages } = await supabase
        .from('shadow_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(20);
      
      setChatHistory(messages || []);
    } catch (error) {
      console.error('Error fetching shadow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const userMsg = { role: 'user', content: chatMessage, created_at: new Date().toISOString() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsTyping(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || TEST_USER_ID;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/shadow/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: chatMessage })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: '', created_at: new Date().toISOString() }]);
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') break;
              try {
                const data = JSON.parse(dataStr);
                fullText += data.text;
                setChatHistory(prev => {
                  const last = prev[prev.length - 1];
                  return [...prev.slice(0, -1), { ...last, content: fullText }];
                });
              } catch (e) {}
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const updatePersonality = async (key: string, value: number) => {
    try {
      const newPersonality = { ...shadow.personality, [key]: value };
      setShadow({ ...shadow, personality: newPersonality });

      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || TEST_USER_ID;

      await supabase
        .from('shadows')
        .update({ personality: newPersonality })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating personality:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-primary"><Skull size={48} /></motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg pb-24 text-text-primary overflow-x-hidden">
      <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 mt-12">
        
        {/* Left Column: Shadow Card & Stats */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative glass p-8 rounded-[40px] border-primary/20 space-y-8">
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                    <Skull size={24} className="text-primary-glow" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase">{shadow?.name}</h1>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{shadow?.archetype}</p>
                  </div>
                </div>
                <div className="bg-primary/20 text-primary-glow px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/30">
                  Evolution {shadow?.evolution_stage || 1}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Evolution Progress (XP)</span>
                  <span className="text-xs font-black italic text-primary-glow">{shadow?.xp || 0} / 1000</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((shadow?.xp || 0) / 1000) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary to-accent shadow-glow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {shadow?.personality?.traits?.map((trait: string) => (
                  <div key={trait} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{trait}</p>
                    <div className="text-text-primary font-black italic text-sm">ACTIVE</div>
                  </div>
                ))}
              </div>

              <div className="bg-[#151516] rounded-3xl p-6 border border-white/5 space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Flame size={12} /> Shadow Backstory
                </h3>
                <p className="text-sm text-text-muted font-medium italic leading-relaxed">
                  "{shadow?.career}"
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="relative group overflow-hidden glass p-6 rounded-[32px] border-white/5 space-y-4">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Zap size={40} className="text-warning" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center justify-between">
                  <span className="flex items-center gap-2 text-warning"><Zap size={14} /> Chaos Score</span>
                  <span className="bg-warning/20 px-2 py-0.5 rounded text-warning border border-warning/30 font-mono">
                    {shadow?.personality?.chaos_score || 85}%
                  </span>
                </h3>
                <div className="relative pt-2">
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={shadow?.personality?.chaos_score || 85}
                    onChange={(e) => updatePersonality('chaos_score', parseInt(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-warning hover:accent-warning/80 transition-all"
                    style={{
                      background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${shadow?.personality?.chaos_score || 85}%, #1a1a1a ${shadow?.personality?.chaos_score || 85}%, #1a1a1a 100%)`
                    }}
                  />
                  <div className="flex justify-between mt-2 text-[8px] font-bold text-text-muted/50 uppercase tracking-widest">
                    <span>Chill</span>
                    <span>Chaotic</span>
                  </div>
                </div>
             </div>

             <div className="relative group overflow-hidden glass p-6 rounded-[32px] border-white/5 space-y-4">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Flame size={40} className="text-danger" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center justify-between">
                   <span className="flex items-center gap-2 text-danger"><Flame size={14} /> Roast Level</span>
                   <span className="bg-danger/20 px-2 py-0.5 rounded text-danger border border-danger/30 font-mono">
                     {shadow?.personality?.roast_level || 92}%
                   </span>
                </h3>
                <div className="relative pt-2">
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={shadow?.personality?.roast_level || 92}
                    onChange={(e) => updatePersonality('roast_level', parseInt(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-danger hover:accent-danger/80 transition-all"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${shadow?.personality?.roast_level || 92}%, #1a1a1a ${shadow?.personality?.roast_level || 92}%, #1a1a1a 100%)`
                    }}
                  />
                  <div className="flex justify-between mt-2 text-[8px] font-bold text-text-muted/50 uppercase tracking-widest">
                    <span>Nice</span>
                    <span>Toxic</span>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Shadow Chat */}
        <div className="flex flex-col h-[700px] lg:h-[800px] glass rounded-[40px] border-primary/20 overflow-hidden relative">
          <div className="p-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Bot size={20} className="text-primary-glow" />
               </div>
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest italic">Shadow Comm Unit</h3>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                     <span className="text-[9px] font-black text-success uppercase tracking-widest">Linked</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {chatHistory.length === 0 && (
              <div className="text-center py-20 opacity-30">
                <Skull className="mx-auto mb-4" size={48} />
                <p className="text-sm font-black italic uppercase">Initiate interaction sequence...</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-text-on-primary rounded-tr-none shadow-lg shadow-primary/10' 
                    : 'bg-surface border border-border text-text-primary rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                     <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                     </div>
                  </div>
               </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 border-t border-white/5 bg-[#151516]">
            <div className="relative">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Speak to your twin..."
                className="w-full bg-surface border border-border rounded-2xl py-4 pl-5 pr-14 text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isTyping}
                className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary-glow disabled:opacity-50 text-text-on-primary w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-glow"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
