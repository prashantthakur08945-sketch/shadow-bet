# Task Plan: B.L.A.S.T. Protocol

# Task Plan: Shadow Bet B.L.A.S.T. Protocol

## Phase 0: Project Setup
- [ ] 0.1 Initialise monorepo: /frontend (Next.js 14), /backend (Express), /shared (types)
- [ ] 0.2 Set up GitHub repo + branch strategy
- [ ] 0.4 Create Supabase project (prod + staging)
- [ ] 0.7 Set up all .env files + document every variable

## Phase 1: Authentication System
- [ ] 1.1 Create users table in Supabase
- [ ] 1.2 Integrate Supabase Auth (email + phone)
- [ ] 1.5 Build POST /auth/send-otp + /auth/verify-otp endpoints
- [ ] 1.9 Build frontend: Sign Up screen

## Phase 2: Onboarding & Shadow Generation
- [ ] 2.1 Create shadows table in Supabase
- [ ] 2.3 Build frontend: quiz screens
- [ ] 2.8 Build POST /shadow/generate endpoint (Claude API)
- [ ] 2.9 Build frontend: Shadow reveal animation
- [ ] 2.10 Build Shadow card image generator (Canvas API)

## Phase 3: Shadow Roast Chat
- [ ] 3.3 Build POST /shadow/chat endpoint (streaming)
- [ ] 3.6 Build frontend: chat UI screen

## Phase 4: Payment System (SHADOW+)
- [ ] 4.3 Build POST /payments/subscribe (Razorpay)
- [ ] 4.4 Build POST /payments/webhook handler
- [ ] 4.11 Build frontend: Razorpay checkout integration

## Phase 5: Dare System
- [ ] 5.1 Create dares, dare_bets, dare_votes tables
- [ ] 5.3 Build GET /dares/feed endpoint
- [ ] 5.4 Build POST /dares/create endpoint
- [ ] 5.10 Build frontend: dare feed screen

## Phase 6: Social Features (Invites + Niches)
- [ ] 6.2 Seed default 6 niches
- [ ] 6.10 Build frontend: niche browsing + join screen

## Phase 7: Shadow Evolution
- [ ] 7.3 Build POST /shadow/evolve endpoint (cron)
- [ ] 7.6 Build frontend: evolution reveal animation

## Phase 8: Polish, QA & Launch Prep
- [ ] 8.1 Full responsive QA
- [ ] 8.8 PWA setup
- [ ] 8.15 LAUNCH 🚀
