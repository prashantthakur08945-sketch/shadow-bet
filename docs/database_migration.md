# Complete B.L.A.S.T Database Reconstruction

We need to recreate the entire Arena infrastructure. This SQL will ensure the `dares` table has the correct columns and recreate the other tables.

**WARNING: This will reset all current bets and wallet balances.**

Please copy this SQL, paste it into your **Supabase SQL Editor**, and click **RUN**.

```sql
-- 1. Ensure 'dares' table has the total_pot_paise column
ALTER TABLE dares ADD COLUMN IF NOT EXISTS total_pot_paise INTEGER DEFAULT 0;
ALTER TABLE dares ADD COLUMN IF NOT EXISTS participants_count INTEGER DEFAULT 0;

-- 2. DROP ALL OLD TABLES (Clean Slate)
DROP TABLE IF EXISTS dare_votes CASCADE;
DROP TABLE IF EXISTS dare_bets CASCADE;
DROP TABLE IF EXISTS dare_leaderboard_entries CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;

-- 1. Niches
CREATE TABLE IF NOT EXISTS niches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    emoji TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- Maps to auth.users.id
    username VARCHAR(50) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Dares
CREATE TABLE IF NOT EXISTS dares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES auth.users(id),
    niche_id UUID REFERENCES niches(id),
    title TEXT NOT NULL,
    category TEXT,
    pot_amount INTEGER DEFAULT 0,
    total_pot_paise INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    proof_url TEXT,
    votes_complete INTEGER DEFAULT 0,
    votes_fail INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
    user_id UUID NOT NULL REFERENCES auth.users(id), 
    type TEXT NOT NULL, 
    amount_paise INTEGER NOT NULL, 
    dare_id UUID REFERENCES dares(id) NULL, 
    razorpay_order_id TEXT NULL, 
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Wallets
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id),
    balance_paise INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bets
CREATE TABLE IF NOT EXISTS dare_bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dare_id UUID REFERENCES dares(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id), 
    amount_paise INTEGER NOT NULL DEFAULT 0, 
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Leaderboard
CREATE TABLE IF NOT EXISTS dare_leaderboard_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
    dare_id UUID NOT NULL REFERENCES dares(id) ON DELETE CASCADE, 
    user_id UUID NOT NULL REFERENCES auth.users(id), 
    amount_paise INTEGER NOT NULL DEFAULT 0, 
    status TEXT DEFAULT 'active',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(dare_id, user_id)
);

-- 7. Arena & Comments
CREATE TABLE IF NOT EXISTS dare_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dare_id UUID REFERENCES dares(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES dare_comments(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  is_arena BOOLEAN DEFAULT false,
  guest_label VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES dare_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type INTEGER CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- 8. Enable RLS
ALTER TABLE dares ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dare_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dare_leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE dare_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

-- 9. Basic Policies
DROP POLICY IF EXISTS "Public Read Dares" ON dares;
CREATE POLICY "Public Read Dares" ON dares FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Wallets" ON wallets;
CREATE POLICY "Public Read Wallets" ON wallets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Bets" ON dare_bets;
CREATE POLICY "Public Read Bets" ON dare_bets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Leaderboard" ON dare_leaderboard_entries;
CREATE POLICY "Public Read Leaderboard" ON dare_leaderboard_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Comments" ON dare_comments;
CREATE POLICY "Public Read Comments" ON dare_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Comments" ON dare_comments;
CREATE POLICY "Public Insert Comments" ON dare_comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Comments" ON dare_comments;
CREATE POLICY "Public Update Comments" ON dare_comments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Read Votes" ON comment_votes;
CREATE POLICY "Public Read Votes" ON comment_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Votes" ON comment_votes;
CREATE POLICY "Public Insert Votes" ON comment_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Delete Votes" ON comment_votes;
CREATE POLICY "Public Delete Votes" ON comment_votes FOR DELETE USING (true);
```

After running this, **restart the backend** and you'll be able to join! 💀🔥
