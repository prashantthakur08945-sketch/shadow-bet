"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function SignupForm({ defaultIsLogin = true }: { defaultIsLogin?: boolean }) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (isLogin) {
        // Sign In Flow
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          [method === 'email' ? 'email' : 'phone']: value,
          password: password,
        });
        if (signInError) throw signInError;
        window.location.href = '/onboarding';
      } else {
        // Sign Up Flow
        const { data, error: signUpError } = await supabase.auth.signUp({
          [method === 'email' ? 'email' : 'phone']: value,
          password: password,
        });
        if (signUpError) throw signUpError;
        
        if (data.session) {
          window.location.href = '/onboarding';
        } else {
          setSuccess('Account created! Please check your email/phone to verify.');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 glass rounded-3xl border-primary/20">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold shadow-font text-primary-glow">
            {isLogin ? 'Login to Shadow' : 'Create Account'}
          </h1>
          <p className="text-text-muted">
            {isLogin ? 'Welcome back to the void.' : 'Start your journey into the chaos.'}
          </p>
        </div>

        <div className="flex p-1 bg-surface-2 rounded-xl border border-border">
          <button
            onClick={() => setMethod('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${method === 'email' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
          >
            <Mail size={18} /> Email
          </button>
          <button
            onClick={() => setMethod('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${method === 'phone' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
          >
            <Phone size={18} /> Phone
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <input
              type={method === 'email' ? 'email' : 'tel'}
              placeholder={method === 'email' ? 'you@chaos.com' : '+91 00000 00000'}
              className="w-full bg-surface-2 border-2 border-border focus:border-primary p-4 rounded-2xl outline-none transition-all text-lg group-hover:border-primary/50"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className="relative group">
            <input
              type="password"
              placeholder="Enter password..."
              className="w-full bg-surface-2 border-2 border-border focus:border-primary p-4 rounded-2xl outline-none transition-all text-lg group-hover:border-primary/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-danger text-sm bg-danger/10 p-3 rounded-xl border border-danger/20">{error}</p>}
        {success && <p className="text-accent text-sm bg-accent/10 p-3 rounded-xl border border-accent/20">{success}</p>}

        <button
          disabled={loading || !value || !password}
          onClick={handleAuth}
          className="w-full bg-primary hover:bg-primary-glow disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all glow-primary active:scale-95"
        >
          {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")} <ArrowRight size={20} />
        </button>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-text-muted hover:text-primary transition-colors text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>
      </div>
    </div>

  );
}
