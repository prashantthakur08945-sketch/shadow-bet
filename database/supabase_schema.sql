-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) UNIQUE,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(30) UNIQUE,
  avatar_url TEXT,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'shadow_plus')),
  wallet_balance INTEGER DEFAULT 0, -- In paise
  invite_code VARCHAR(10) UNIQUE,
  invited_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shadows Table
CREATE TABLE IF NOT EXISTS shadows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50),
  archetype VARCHAR(50),
  career TEXT,
  personality JSONB,
  aesthetic TEXT,
  backstory TEXT,
  xp INTEGER DEFAULT 0,
  evolution_stage INTEGER DEFAULT 1 CHECK (evolution_stage BETWEEN 1 AND 5),
  card_image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Niches Table
CREATE TABLE IF NOT EXISTS niches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE,
  emoji VARCHAR(10),
  theme TEXT,
  creator_id UUID REFERENCES users(id),
  member_count INTEGER DEFAULT 0,
  color VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dares Table
CREATE TABLE IF NOT EXISTS dares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id),
  target_id UUID REFERENCES users(id),
  niche_id UUID REFERENCES niches(id),
  title VARCHAR(200),
  category VARCHAR(20) CHECK (category IN ('social', 'creative', 'unhinged', 'physical')),
  pot_amount INTEGER DEFAULT 0, -- In paise
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'completed', 'failed', 'expired')),
  proof_url TEXT,
  votes_complete INTEGER DEFAULT 0,
  votes_fail INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount INTEGER, -- In paise
  type VARCHAR(20) CHECK (type IN ('topup', 'withdrawal', 'bet', 'win', 'subscription')),
  status VARCHAR(20) DEFAULT 'pending',
  reference_id TEXT, -- Razorpay ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone, email, username, invite_code)
  VALUES (
    new.id,
    new.phone,
    new.email,
    'user_' || substr(md5(random()::text), 1, 8), -- Default random username
    substr(md5(random()::text), 1, 10)            -- Default invite code
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Shadow Messages Table (Roast Chat)
CREATE TABLE IF NOT EXISTS shadow_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dare Bets Table
CREATE TABLE IF NOT EXISTS dare_bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dare_id UUID REFERENCES dares(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER, -- In paise
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dare_id, user_id) -- Prevent double betting
);

-- Dare Comments Table
CREATE TABLE IF NOT EXISTS dare_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dare_id UUID REFERENCES dares(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Optional for anonymous posts
  parent_id UUID REFERENCES dare_comments(id) ON DELETE CASCADE, -- For threaded replies
  content TEXT NOT NULL,
  guest_label VARCHAR(30),
  media_url TEXT,
  is_arena BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for dare_comments
ALTER TABLE dare_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON dare_comments FOR SELECT USING (true);
CREATE POLICY "Public post comments" ON dare_comments FOR INSERT WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE dare_comments;

-- Comment Votes Table
CREATE TABLE IF NOT EXISTS comment_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES dare_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type INTEGER CHECK (vote_type IN (1, -1)),
  UNIQUE(comment_id, user_id)
);

-- Dare Arena Messages Table
CREATE TABLE IF NOT EXISTS dare_arena_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dare_id UUID NOT NULL REFERENCES dares(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guest_label VARCHAR(30),
    content TEXT NOT NULL,
    proof_url TEXT DEFAULT NULL,
    proof_type TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dare_arena_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read arena" ON dare_arena_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can post in arena" ON dare_arena_messages FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE dare_arena_messages;
