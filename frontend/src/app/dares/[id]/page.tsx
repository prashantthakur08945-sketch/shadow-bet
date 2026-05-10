"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, Users, Trophy, Flame, ArrowLeft, ShieldCheck, 
  Share2, Lock, MessageSquare, Send, MoreHorizontal, ArrowBigUp, ArrowBigDown,
  Video, X, Sword, Shield, Zap, Info, ChevronRight, Check, Camera, Clock, Skull
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import UpgradeModal from '@/components/UpgradeModal';

const supabase = createClient();

// --- Components ---

function CommentItem({ comment, allComments, onVote, onReply, currentUser }: any) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const replies = allComments.filter((c: any) => c.parent_id === comment.id);

  const authorName = comment.user?.username ? `u/${comment.user.username}` : (comment.guest_label || 'u/Guest');
  const authorInitial = (comment.user?.username?.[0] || '?').toUpperCase();

  return (
    <div className="space-y-3">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`p-4 space-y-3 ${comment.parent_id ? 'ml-6 border-l border-white/5 pl-6 mt-2' : 'bg-[#1A1A1B] border border-[#343536] rounded-2xl shadow-xl'}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border border-white/10 text-white font-bold ${!comment.user ? 'bg-surface-2' : 'bg-primary/20'}`}>
              {authorInitial}
            </div>
            <span className="text-[11px] font-black text-text-primary italic tracking-tight">{authorName}</span>
            <span className="text-[10px] text-text-muted font-bold">• 12m ago</span>
          </div>
          <button className="text-text-muted hover:text-white transition-colors"><MoreHorizontal size={14} /></button>
        </div>
        
        <p className="text-sm text-text-primary/90 leading-relaxed font-medium">{comment.content}</p>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 bg-white/2 rounded-full px-2 py-1">
            <button onClick={() => onVote(comment.id, 1)} className={`hover:text-primary transition-colors ${comment.userVote === 1 ? 'text-primary' : ''}`}><ArrowBigUp size={16} /></button>
            <span className="text-xs font-black text-text-primary italic min-w-[12px] text-center">{comment.respect || 0}</span>
            <button onClick={() => onVote(comment.id, -1)} className={`hover:text-primary transition-colors ${comment.userVote === -1 ? 'text-primary' : ''}`}><ArrowBigDown size={16} /></button>
          </div>
          <button onClick={() => setShowReply(!showReply)} className="flex items-center gap-1.5 text-[10px] font-black italic uppercase tracking-widest text-text-muted hover:text-white transition-colors">
            <MessageSquare size={14} /> Reply
          </button>
        </div>

        <AnimatePresence>
          {showReply && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-2">
              <div className="flex gap-2">
                <input 
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary transition-all"
                  onKeyDown={(e) => { if(e.key === 'Enter') { onReply(comment.id, replyText); setReplyText(''); setShowReply(false); } }}
                />
                <button 
                  onClick={() => { onReply(comment.id, replyText); setReplyText(''); setShowReply(false); }}
                  className="bg-primary text-white p-2 rounded-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {replies.map((reply: any) => (
        <CommentItem key={reply.id} comment={reply} allComments={allComments} onVote={onVote} onReply={onReply} currentUser={currentUser} />
      ))}
    </div>
  );
}

function ArenaMessageItem({ message, allMessages, onVote, onReply, currentUser }: any) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const replies = (allMessages || []).filter((m: any) => m.parent_id === message.id);

  const authorName = message.user?.username ? `u/${message.user.username}` : (message.guest_label || 'u/Guest');
  const authorInitial = (message.user?.username?.[0] || '?').toUpperCase();

  return (
    <div className="space-y-3">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 space-y-3 ${message.parent_id ? 'ml-6 border-l border-warning/20 pl-6 mt-2' : 'bg-[#1A1A1B] border border-warning/10 rounded-2xl shadow-xl'}`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center text-[10px] border border-warning/10 text-warning font-bold">
            {authorInitial}
          </div>
          <span className="text-[11px] font-black text-text-primary italic tracking-tight">{authorName}</span>
          <span className="text-[9px] text-text-muted font-bold">• 2m ago</span>
        </div>
        {message.content && <p className="text-sm text-text-primary/90 font-medium leading-relaxed">{message.content}</p>}
        {message.media_url && (
          <div className="rounded-xl overflow-hidden border border-white/5 shadow-2xl">
            {message.media_url.match(/\.(mp4|mov|webm)$/i) ? (
              <video src={message.media_url} className="w-full h-auto" autoPlay muted loop playsInline />
            ) : (
              <img src={message.media_url} className="w-full h-auto cursor-pointer" onClick={() => window.open(message.media_url)} />
            )}
          </div>
        )}
        
        {/* Interactions */}
        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-1 bg-white/2 rounded-full px-2 py-1">
            <button onClick={() => onVote(message.id, 1)} className={`hover:text-warning transition-colors ${message.userVote === 1 ? 'text-warning' : ''}`}><ArrowBigUp size={16} /></button>
            <span className="text-xs font-black text-text-primary italic min-w-[12px] text-center">{message.respect || 0}</span>
            <button onClick={() => onVote(message.id, -1)} className={`hover:text-warning transition-colors ${message.userVote === -1 ? 'text-warning' : ''}`}><ArrowBigDown size={16} /></button>
          </div>
          <button onClick={() => setShowReply(!showReply)} className="flex items-center gap-1.5 text-[10px] font-black italic uppercase tracking-widest text-text-muted hover:text-warning transition-colors">
            <MessageSquare size={14} /> Reply
          </button>
        </div>

        {/* Reply Input */}
        <AnimatePresence>
          {showReply && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-2">
              <div className="flex gap-2">
                <input 
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Taunt back..."
                  className="flex-1 bg-black/40 border border-warning/20 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-warning transition-all"
                  onKeyDown={(e) => { if(e.key === 'Enter') { onReply(message.id, replyText); setReplyText(''); setShowReply(false); } }}
                />
                <button 
                  onClick={() => { onReply(message.id, replyText); setReplyText(''); setShowReply(false); }}
                  className="bg-warning text-black p-2 rounded-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Render Nested Replies */}
      {replies.map((reply: any) => (
        <ArenaMessageItem key={reply.id} message={reply} allMessages={allMessages} onVote={onVote} onReply={onReply} currentUser={currentUser} />
      ))}
    </div>
  );
}

const TEST_USER_ID = '6a634726-babe-465b-907d-7f44a8735806'; // Real Test God in this DB

// --- Page ---

export default function DareDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const arenaFeedEndRef = useRef<HTMLDivElement>(null);

  const [dare, setDare] = useState<any>(null);
  const [arenaMessages, setArenaMessages] = useState<any[]>([]);
  const [betters, setBetters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'arena'>('arena');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userHasBet, setUserHasBet] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isCreator, setIsCreator] = useState(false);

  // Arena Specific State
  const [arenaInput, setArenaInput] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [arenaProofUrl, setArenaProofUrl] = useState<string | null>(null);
  const [proofType, setProofType] = useState<'image' | 'video' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [arenaError, setArenaError] = useState<string | null>(null);

  // Modals / UI State
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showBetSelector, setShowBetSelector] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState<{ message: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string, id: number } | null>(null);

  // --- Leaderboard Computation ---
  const leaderboard = useMemo(() => {
    const scores = arenaMessages.reduce((acc: any, msg: any) => {
      // Don't count guests for the money leaderboard
      if (!msg.user) return acc;
      
      const userId = msg.user.id;
      if (!acc[userId]) {
        acc[userId] = {
          user: msg.user,
          totalRespect: 0,
          proofs: 0,
          taunts: 0
        };
      }
      
      acc[userId].totalRespect += (msg.respect || 0);
      if (msg.media_url) acc[userId].proofs += 1;
      else acc[userId].taunts += 1;
      
      return acc;
    }, {});

    return Object.values(scores)
      .sort((a: any, b: any) => b.totalRespect - a.totalRespect)
      .slice(0, 10);
  }, [arenaMessages]);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  useEffect(() => {
    const cleanupRealtime = setupRealtime();
    return () => {
      cleanupRealtime();
    };
  }, [id, activeTab]); // Re-subscribe on tab switch if needed

  useEffect(() => {
    if (activeTab === 'arena') {
      arenaFeedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [arenaMessages, activeTab]);

  async function fetchInitialData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
        setCurrentUser(userData);

        // Fetch Wallet
        const { data: wallet } = await supabase.from('wallets').select('balance_paise').eq('user_id', user.id).single();
        if (wallet) setWalletBalance(wallet.balance_paise);

        const { data: bet } = await supabase.from('dare_bets').select('*').eq('dare_id', id).eq('user_id', user.id).single();
        if (bet) setUserHasBet(true);

        if (userData?.id === dare?.creator_id) setIsCreator(true);
      } else {
        // TEST MODE: Use dummy identity
        const testUser = { id: TEST_USER_ID, username: 'TestGod_💀' };
        setCurrentUser(testUser);
        setWalletBalance(1000000); // Exactly ₹10,000 for testing
        if (testUser.id === dare?.creator_id) setIsCreator(true);
      }

      const { data: dareData, error: dareError } = await supabase
        .from('dares')
        .select('*, niche:niches(name, emoji)')
        .eq('id', id)
        .single();
      
      if (dareError) throw dareError;

      if (dareData) {
        // Use total_pot_paise as source of truth
        setDare({ ...dareData, pot_amount: dareData.total_pot_paise || dareData.pot_amount });
        
        // Update Timer
        const interval = setInterval(() => {
          const now = new Date().getTime();
          const end = new Date(dareData.expires_at || Date.now()).getTime();
          const diff = end - now;
          if (diff <= 0) {
            setTimeLeft('EXPIRED');
            clearInterval(interval);
          } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${hours}h ${mins}m ${secs}s`);
          }
        }, 1000);
      }

      const { data: bettersData } = await supabase
        .from('dare_bets')
        .select('*, user:users(username, avatar_url)')
        .eq('dare_id', id)
        .order('created_at', { ascending: false });
      setBetters(bettersData || []);

      await fetchArenaMessages();
    } catch (err: any) {
      console.error('Dare Load Error:', err);
      setArenaError(`CRITICAL ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function setupRealtime() {
    const dareSub = supabase
      .channel(`dare_updates_${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'dares', filter: `id=eq.${id}` }, (payload) => {
        setDare((prev: any) => ({ ...prev, ...payload.new, pot_amount: payload.new.total_pot_paise }));
      })
      .subscribe();

    const commentSub = supabase
      .channel(`dare_comments_${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dare_comments', filter: `dare_id=eq.${id}` }, () => {
        fetchArenaMessages();
      })
      .subscribe();

    const betSub = supabase
      .channel(`dare_bets_${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dare_bets', filter: `dare_id=eq.${id}` }, () => {
        supabase.from('dare_bets').select('*, user:users(username, avatar_url)').eq('dare_id', id).order('created_at', { ascending: false })
          .then(({ data }) => {
            setBetters(data || []);
            const toastId = Date.now();
            setToastMessage({ text: "A new challenger entered the Arena! 💀", id: toastId });
            setTimeout(() => {
              setToastMessage((prev) => (prev?.id === toastId ? null : prev));
            }, 4000);
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dareSub);
      supabase.removeChannel(commentSub);
      supabase.removeChannel(betSub);
    };
  }

  async function fetchArenaMessages() {
    const { data } = await supabase
      .from('dare_comments')
      .select('*, user:users(*), comment_votes(*)')
      .eq('dare_id', id)
      .eq('is_arena', true)
      .order('created_at', { ascending: true });
    
    const processed = (data || []).map(c => {
      const respect = c.comment_votes?.reduce((acc: number, v: any) => acc + v.vote_type, 0) || 0;
      const userVote = c.comment_votes?.find((v: any) => v.user_id === currentUser?.id)?.vote_type || 0;
      return { ...c, respect, userVote };
    });
    setArenaMessages(processed);
  }

  const handleRespectVote = async (commentId: string, type: 1 | -1) => {
    const userId = currentUser?.id || TEST_USER_ID;
    const comment = arenaMessages.find(c => c.id === commentId);
    if (!comment) return;
    if (comment.userVote === type) {
      await supabase.from('comment_votes').delete().eq('comment_id', commentId).eq('user_id', userId);
    } else {
      await supabase.from('comment_votes').upsert({ comment_id: commentId, user_id: userId, vote_type: type });
    }
    fetchArenaMessages();
  };

  // --- Arena Logic ---

  async function postToArenaReply(parentId: string, content: string) {
    if (!content.trim()) return;
    const { error } = await supabase.from('dare_comments').insert({
      dare_id: id,
      user_id: currentUser?.id || null,
      guest_label: currentUser ? null : 'u/Guest',
      parent_id: parentId,
      content: content,
      is_arena: true
    });
    if (!error) fetchArenaMessages();
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowed = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'];
    if (!allowed.includes(file.type)) {
      setArenaError("Only jpg, png, mp4, mov files allowed.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setArenaError("File too large. Max 50MB allowed.");
      return;
    }

    setArenaError(null);
    setProofFile(file);
    setProofType(file.type.startsWith('video') ? 'video' : 'image');
    
    // Upload immediately
    setUploading(true);
    setUploadProgress(10);
    
    const path = `dare-proofs/${id}/${currentUser?.id || 'guest'}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('proofs').upload(path, file);
    
    if (error) {
      console.error("Supabase Storage Error:", error);
      setArenaError(`UPLOAD FAILED: ${error.message}`);
      setProofFile(null);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(path);
    setArenaProofUrl(publicUrl);
    setUploadProgress(100);
    setUploading(false);
  };

  const removeProof = async () => {
    // Note: Actually deleting from storage would require the path
    setProofFile(null);
    setArenaProofUrl(null);
    setProofType(null);
    setUploadProgress(0);
  };

  const postToArena = async () => {
    // Step 1: Validate input
    const content = arenaInput.trim();
    if (content.length === 0 && !arenaProofUrl) {
      setArenaError("Write something or add proof before posting.");
      return;
    }

    try {
      // Get session if available
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const dareId = id;

      // UX Check: Must have "Joined" (either real or simulated)
      if (!userHasBet) {
        setArenaError("Join the pot to post in the Arena.");
        return;
      }

      // Step 4 & 5: Build and Insert into dare_comments
      const { data, error } = await supabase.from('dare_comments').insert({
        dare_id: dareId,
        user_id: userId,
        guest_label: userId ? null : 'u/Guest',
        content: content,
        media_url: arenaProofUrl || null,
        is_arena: true,
        parent_id: null
      }).select('*, user:users(*)').single();

      if (error) {
        console.error('Supabase Insert Error:', error);
        if (error.code === 'PGRST116' || error.message.includes('not found')) {
          throw new Error("Table missing. Run the Emergency SQL Repair script.");
        }
        throw new Error(error.message || 'Unknown database error');
      }

      // Step 6: Success - Instantly update UI
      setArenaMessages(prev => [...prev, data]);
      
      setArenaInput('');
      setProofFile(null);
      setArenaProofUrl(null);
      setProofType(null);
      setArenaError(null);
      
      // Secondary sync
      fetchArenaMessages();
      
      alert("Posted to the Arena 💀");
    } catch (err: any) {
      console.error('Arena post failed full object:', err);
      setArenaError(`FAILED TO POST: ${err.message || 'Check Console'}`);
    }
  };

  const handleJoinPot = () => {
    setShowBetSelector(true);
  };

  const placeBet = async (amount: number) => {
    const userId = currentUser?.id || TEST_USER_ID;
    const amountInPaise = amount * 100;
    
    if (walletBalance !== null && walletBalance < amountInPaise) {
      alert("Not enough balance. Top up your wallet!");
      router.push('/wallet');
      return;
    }

    setLoading(true);
    try {
      // Optimistic UI
      setUserHasBet(true);
      setShowBetSelector(false);
      setDare((prev: any) => ({ ...prev, pot_amount: (prev.pot_amount || 0) + amountInPaise }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/dares/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dare_id: id,
          userId: userId,
          amount_paise: amountInPaise
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setWalletBalance(data.new_wallet_balance);
      alert("You are in the Arena 💀");
    } catch (err: any) {
      // Revert Optimistic UI
      setUserHasBet(false);
      setDare((prev: any) => ({ ...prev, pot_amount: (prev.pot_amount || 0) - amountInPaise }));
      alert(err.message || "Failed to enter Arena");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: 'complete' | 'fail') => {
    const userId = currentUser?.id || TEST_USER_ID;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/dares/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dare_id: id, userId, vote_type: type })
      });
      const data = await res.json();
      if (data.success) alert("Vote Cast! 💀");
    } catch (err) {
      alert("Failed to vote");
    }
  };

  const handleProofSubmit = async () => {
    const userId = currentUser?.id || TEST_USER_ID;
    if (!proofUrl) return alert("Enter a proof URL (image/video)");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/dares/${id}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dare_id: id, userId, proof_url: proofUrl })
      });
      const data = await res.json();
      if (data.success) {
        alert("Proof submitted! Waiting for community verdict...");
        setShowProofModal(false);
      }
    } catch (err) {
      alert("Failed to submit proof");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-primary-glow">
          <Skull size={48} />
        </motion.div>
      </div>
    );
  }

  if (arenaError || !dare) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <div className="glass p-12 rounded-[40px] border-danger/20 text-center space-y-6">
          <Skull size={64} className="mx-auto text-danger animate-bounce" />
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">DARE_NOT_FOUND</h1>
          <p className="text-text-muted">This challenge has been consumed by the void.</p>
          <button onClick={() => window.location.href = '/feed'} className="bg-primary hover:bg-primary-glow px-8 py-3 rounded-2xl font-bold transition-all shadow-glow">RETURN TO FEED</button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg pb-24">
      {/* Header */}
      <div className="bg-[#1A1A1B] border-b border-[#343536] px-4 py-2 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs shadow-glow">{dare.niche?.emoji}</div>
              <div>
                <p className="text-[12px] font-bold text-text-primary tracking-tight">s/{dare.niche?.name.toLowerCase()}</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Competitive Arena</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 p-4">
        <div className="space-y-6">
          <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-6 space-y-4 shadow-2xl relative">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
             <div className="flex justify-between items-start relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 text-[10px] font-black italic tracking-widest uppercase items-center">
                  <span className="bg-primary/20 text-primary-glow px-2 py-0.5 rounded border border-primary/30">{dare.category}</span>
                  <span className="bg-danger/20 text-danger px-2 py-0.5 rounded border border-danger/30">HIGH STAKES</span>
                  <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20 ml-2">
                    <Clock size={12} />
                    <span className="tabular-nums">{timeLeft}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-primary bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <Users size={12} className="text-primary" />
                    <span>{betters.length} IN ARENA</span>
                  </div>
                </div>
                <h1 className="text-3xl font-black text-text-primary leading-tight uppercase italic tracking-tighter">{dare.title}</h1>
              </div>
              <div className="text-right">
                <p className="text-success text-3xl font-black italic drop-shadow-glow">₹{dare.pot_amount / 100}</p>
                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Live Pot</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-[#343536] sticky top-[48px] bg-bg z-40 pt-2">
            <button onClick={() => setActiveTab('leaderboard')} className={`flex-1 py-4 text-xs font-black italic tracking-widest uppercase transition-all relative flex items-center justify-center gap-2 ${activeTab === 'leaderboard' ? 'text-text-primary' : 'text-text-muted hover:text-text-primary/60'}`}>
              <Trophy size={14} /> LEADERBOARD
              {activeTab === 'leaderboard' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary shadow-glow" />}
            </button>
            <button onClick={() => setActiveTab('arena')} className={`flex-1 py-4 text-xs font-black italic tracking-widest uppercase transition-all relative flex items-center justify-center gap-2 ${activeTab === 'arena' ? 'text-warning' : 'text-text-muted hover:text-warning/60'}`}>
              THE ARENA {!userHasBet && <Lock size={12} />}
              {activeTab === 'arena' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-warning shadow-glow" />}
            </button>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'leaderboard' ? (
                <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="bg-[#1A1A1B] border border-primary/20 rounded-2xl p-6 shadow-2xl space-y-2">
                    <h2 className="text-xl font-black text-text-primary italic uppercase tracking-tighter">Current Standings</h2>
                    <p className="text-xs text-text-muted font-bold">Top 3 challengers split the ₹{dare.pot_amount / 100} pot. Ranked by Arena Respect.</p>
                  </div>
                  
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-20 border border-[#343536] border-dashed rounded-3xl opacity-50"><p className="text-text-muted italic text-sm">No challengers have gained respect yet.</p></div>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard.map((player: any, index: number) => {
                        const isFirst = index === 0;
                        const isSecond = index === 1;
                        const isThird = index === 2;
                        
                        let rankColor = "text-white/40";
                        let borderStyle = "border-white/5 bg-[#1A1A1B]";
                        let payout = 0;
                        
                        if (isFirst) {
                          rankColor = "text-yellow-400";
                          borderStyle = "border-yellow-400/50 bg-yellow-400/10 shadow-[0_0_30px_rgba(250,204,21,0.1)]";
                          payout = (dare.pot_amount / 100) * 0.5;
                        } else if (isSecond) {
                          rankColor = "text-gray-300";
                          borderStyle = "border-gray-300/40 bg-gray-300/5";
                          payout = (dare.pot_amount / 100) * 0.3;
                        } else if (isThird) {
                          rankColor = "text-amber-600";
                          borderStyle = "border-amber-600/40 bg-amber-600/5";
                          payout = (dare.pot_amount / 100) * 0.2;
                        }

                        return (
                          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} key={player.user.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${borderStyle}`}>
                            <div className="flex items-center gap-4">
                              <div className={`text-2xl font-black italic w-8 text-center ${rankColor}`}>
                                #{index + 1}
                              </div>
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-2 border border-white/10">
                                <img src={player.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.user.username}`} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-text-primary font-black italic tracking-tight text-sm">u/{player.user.username}</p>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{player.proofs} Proofs • {player.taunts} Taunts</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 justify-end text-text-primary">
                                <ArrowBigUp size={16} className="text-primary" />
                                <span className="font-black italic text-lg">{player.totalRespect}</span>
                              </div>
                              {payout > 0 && <p className="text-[10px] font-black italic text-success tracking-widest uppercase mt-0.5">EST. POT: ₹{payout.toFixed(0)}</p>}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ) : !userHasBet ? (
                <motion.div key="spectator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-warning/5 border border-warning/20 rounded-2xl p-8 text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto text-warning"><Users size={32} /></div>
                  <h3 className="text-xl font-black italic text-text-primary uppercase">Arena Spectator Mode</h3>
                  <p className="text-sm text-text-muted max-w-xs mx-auto font-medium">Talk to competitors and watch the chaos for free, or join the pot to win stakes.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => setUserHasBet(true)} className="bg-warning hover:bg-warning/80 text-black px-12 py-3 rounded-xl text-sm font-black italic tracking-widest uppercase transition-all shadow-glow">ENTER</button>
                    <button onClick={handleJoinPot} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl text-sm font-black italic tracking-widest uppercase transition-all border border-white/10">DIRECT JOIN</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="arena" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="bg-[#1A1A1B] border border-warning/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    {/* Proof & Voting Section */}
          {dare.proof_url ? (
            <div className="glass p-6 rounded-3xl border-primary/20 mb-8 space-y-4">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Shield size={20} /> COMMUNITY VERDICT REQUIRED
              </h3>
              <p className="text-sm text-text-muted">Creator has submitted proof. Vote now to settle the pot.</p>
              <div className="aspect-video bg-black rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
                <img src={dare.proof_url} alt="Proof" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleVote('complete')}
                  className="bg-success/20 hover:bg-success/30 text-success border border-success/30 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Check size={20} /> LEGIT ({dare.votes_complete || 0})
                </button>
                <button 
                  onClick={() => handleVote('fail')}
                  className="bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <X size={20} /> CAP ({dare.votes_fail || 0})
                </button>
              </div>
            </div>
          ) : isCreator && userHasBet ? (
            <div className="glass p-6 rounded-3xl border-primary/20 mb-8 text-center space-y-4">
              <h3 className="text-lg font-bold text-primary">Ready to Claim the Pot? 💀</h3>
              <p className="text-sm text-text-muted">You are participating in this dare. Submit proof to start the voting.</p>
              <button 
                onClick={() => setShowProofModal(true)}
                className="w-full bg-primary hover:bg-primary-glow text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                SUBMIT PROOF <Shield size={20} />
              </button>
            </div>
          ) : null}

          <div className="flex gap-4 mb-8">
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex-shrink-0 flex items-center justify-center border border-warning/10 font-bold text-warning">
                        {currentUser?.username?.[0].toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 space-y-4">
                        {/* Proof Preview */}
                        {arenaProofUrl && (
                          <div className="relative inline-block group">
                            {proofType === 'image' ? (
                              <img src={arenaProofUrl} className="h-32 w-56 object-cover rounded-xl border-2 border-warning shadow-2xl" />
                            ) : (
                              <video src={arenaProofUrl} className="h-32 w-56 object-cover rounded-xl border-2 border-warning" muted />
                            )}
                            <button onClick={removeProof} className="absolute -top-2 -right-2 bg-danger rounded-full p-1.5 shadow-xl hover:scale-110 transition-transform"><X size={14} /></button>
                            <div className="mt-1 text-[9px] text-text-muted font-bold uppercase">{proofFile?.name} ({(proofFile?.size || 0) / 1024 / 1024 | 0}MB)</div>
                          </div>
                        )}
                        
                        <div className="relative">
                          <textarea
                            value={arenaInput}
                            onChange={(e) => setArenaInput(e.target.value.slice(0, 500))}
                            placeholder="Speak your mind in the Arena..."
                            className="w-full bg-surface border border-border rounded-xl p-4 text-sm focus:border-warning outline-none min-h-[120px] text-text-primary resize-none transition-all"
                          />
                          <div className="absolute bottom-4 right-4 text-[9px] font-black italic text-text-muted">{arenaInput.length}/500</div>
                          <AnimatePresence>
                            {arenaError && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-4 left-4 text-[10px] text-danger font-black italic uppercase">{arenaError}</motion.div>}
                          </AnimatePresence>
                          {uploading && <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden"><motion.div initial={{ x: '-100%' }} animate={{ x: `${uploadProgress - 100}%` }} className="h-full bg-warning" /></div>}
                        </div>

                        <div className="flex justify-between items-center">
                          <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2 text-[10px] font-black italic tracking-widest px-4 py-2 rounded-lg transition-all uppercase ${arenaProofUrl ? 'bg-success/10 text-success' : 'text-text-muted hover:text-white'}`}>
                            <Camera size={16} /> {arenaProofUrl ? 'PROOF ADDED ✓' : 'ADD PROOF'}
                          </button>
                          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".jpg,.jpeg,.png,.mp4,.mov" />
                          <button onClick={postToArena} className="bg-[#1A1A1B] border border-white/10 hover:bg-warning hover:text-black hover:border-warning text-white px-10 py-3 rounded-xl text-xs font-black italic tracking-widest uppercase shadow-glow transition-all">POST TO ARENA</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar scroll-smooth p-2">
                    {arenaMessages.length === 0 ? (
                      <div className="text-center py-20 border border-warning/10 border-dashed rounded-3xl opacity-50"><p className="text-warning/60 italic text-sm">The Arena is silent. Be the first to speak.</p></div>
                    ) : (
                      arenaMessages.filter(m => !m.parent_id).map(m => <ArenaMessageItem key={m.id} message={m} allMessages={arenaMessages} onVote={handleRespectVote} onReply={postToArenaReply} currentUser={currentUser} />)
                    )}
                    <div ref={arenaFeedEndRef} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#1A1A1B] border border-[#343536] rounded-2xl p-6 space-y-6 shadow-xl sticky top-[80px]">
            <h3 className="text-[11px] font-black italic text-text-primary uppercase tracking-widest flex items-center gap-2">
              <Sword size={16} className="text-primary" /> Active Challengers
            </h3>
            <div className="space-y-3">
              {betters.slice(0, 5).map((better) => (
                <div key={better.id} onClick={() => router.push(`/profile/${better.user?.username}`)} className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden bg-surface-2 shadow-inner">
                      <img src={better.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${better.user?.username}`} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-black text-text-primary italic tracking-tight">u/{better.user?.username}</span>
                  </div>
                  <div className="text-[9px] font-black italic text-success uppercase tracking-widest">₹{better.amount / 100}</div>
                </div>
              ))}
              {betters.length > 5 && <p className="text-center text-[10px] text-text-muted font-bold">+{betters.length - 5} more rivals</p>}
              {betters.length === 0 && <p className="text-center text-[10px] text-text-muted italic py-6 uppercase tracking-widest">No rivals yet...</p>}
            </div>
            {!userHasBet ? (
              <button onClick={handleJoinPot} className="w-full font-black italic py-4 rounded-xl text-xs uppercase tracking-widest bg-warning text-black hover:bg-warning/80 shadow-glow transition-all">DIRECT JOIN</button>
            ) : (
              <div className="w-full font-black italic py-4 rounded-xl text-xs uppercase tracking-widest bg-success/20 text-success border border-success/30 flex items-center justify-center gap-2 cursor-default"><Check size={16} /> YOU'RE IN 💀</div>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />

      <AnimatePresence>
        {showAuthPopup && (
          <div key="auth-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm glass p-8 rounded-[40px] border-primary/20 space-y-6 shadow-2xl">
              <div className="text-center space-y-3">
                <Shield className="mx-auto text-primary" size={48} />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Auth Required</h2>
                <p className="text-text-muted text-xs font-bold leading-relaxed">{showAuthPopup.message}</p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => router.push(`/auth/signup?return_url=/dares/${id}`)} className="w-full py-4 rounded-2xl bg-primary text-white font-black italic tracking-widest text-sm uppercase shadow-glow">Sign Up Free</button>
                <button onClick={() => router.push(`/auth/login?return_url=/dares/${id}`)} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black italic tracking-widest text-sm uppercase">Log In</button>
                <button onClick={() => setShowAuthPopup(null)} className="w-full text-text-muted text-[10px] font-black uppercase tracking-widest hover:text-white pt-2">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}

        {showBetSelector && (
          <div key="bet-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm glass p-8 rounded-[40px] border-primary/20 space-y-6 shadow-2xl">
              <div className="text-center space-y-2">
                <Sword className="mx-auto text-primary" size={48} />
                <h2 className="text-2xl font-black italic uppercase italic tracking-tighter text-white">Select Your Stake</h2>
                <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">Entry fee to the high-stakes Arena.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[10, 25, 50, 100].map(amount => (
                  <button key={amount} onClick={() => placeBet(amount)} className="py-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-primary transition-all font-black italic tracking-widest text-lg hover:scale-105 active:scale-95">₹{amount}</button>
                ))}
              </div>
              <button onClick={() => setShowBetSelector(false)} className="w-full text-text-muted text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Abort Mission</button>
            </motion.div>
          </div>
        )}
        {showProofModal && (
          <div key="proof-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm glass p-8 rounded-[40px] border-primary/20 space-y-6 shadow-2xl">
              <div className="text-center space-y-2">
                <Shield className="mx-auto text-primary" size={48} />
                <h2 className="text-2xl font-black italic text-white">SUBMIT PROOF</h2>
                <p className="text-text-muted">Paste your evidence URL below (Imgur/YouTube/etc)</p>
              </div>
              <input 
                type="text" 
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-all"
              />
              <div className="space-y-3">
                <button 
                  onClick={handleProofSubmit}
                  className="w-full bg-primary hover:bg-primary-glow text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-primary/20"
                >
                  GO LIVE ⚡
                </button>
                <button 
                  onClick={() => setShowProofModal(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white/50 py-4 rounded-2xl font-bold transition-all"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] glass px-6 py-3 rounded-full border border-primary/30 shadow-[0_0_40px_rgba(108,43,217,0.3)] flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary animate-pulse">
              <Sword size={16} />
            </div>
            <span className="text-sm font-black italic text-white uppercase tracking-widest">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
