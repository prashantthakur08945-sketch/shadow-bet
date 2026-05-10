"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Skull, User, ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Welcome to Shadow Bet. I'm your AI guide. Need help with Dares, the Arena, or your Wallet? Ask away." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ALL_QUESTIONS = [
    "How do I create a Dare?",
    "What is the B.L.A.S.T Protocol?",
    "How does voting work in the Arena?",
    "How can I top up my wallet?",
    "What are Shadow personality traits?",
    "How do I win the Pot?",
    "Are the payouts automated?",
    "Tell me about the Arena."
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUser(user);
    });
    
    // Shuffle and pick 3 random questions
    const shuffled = [...ALL_QUESTIONS].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      if (!currentUser) return alert("You must be logged in to chat.");

      let assistantMsg: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMsg]);

      const response = await fetch('http://localhost:5000/api/shadow/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, message: input })
      });

      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            
            try {
              const data = JSON.parse(dataStr);
              assistantMsg.content += data.text;
              setMessages(prev => [...prev.slice(0, -1), { ...assistantMsg }]);
            } catch (e) {
              // Ignore partial JSON parsing errors
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-bg flex flex-col items-center p-4 pb-28">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between py-4 border-b border-border mb-4">
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-xl font-bold shadow-font text-text-primary uppercase tracking-widest">VoidHeart</h1>
          <span className="text-[10px] text-success flex items-center gap-1">
            <span className="w-1 h-1 bg-success rounded-full animate-pulse" /> Platform Guide Mode
          </span>
        </div>
        </div>

      {/* Chat Area */}
      <div className="flex-1 w-full max-w-2xl overflow-y-auto space-y-6 px-2 py-4 no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary/20 text-primary-glow' : 'bg-surface-2 text-text-muted'}`}>
                  {msg.role === 'assistant' ? <Skull size={16} /> : <User size={16} />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'assistant' ? 'glass border-primary/20 text-white shadow-glow' : 'bg-surface-2 border border-border text-text-primary'}`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="w-full max-w-2xl py-6 flex flex-col gap-3">
        {/* Suggested Questions */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {suggestions.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(q);
              }}
              className="shrink-0 bg-surface-2 border border-border hover:border-primary/50 text-xs text-text-muted hover:text-white px-4 py-2 rounded-full transition-all whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="relative group">
          <input
            type="text"
            placeholder="Ask me anything about Shadow Bet..."
            className="w-full bg-surface-2 border-2 border-border focus:border-primary p-4 pr-16 rounded-2xl outline-none transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary-glow px-4 rounded-xl text-white transition-all glow-primary disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}
