# Environment Variables Setup

## Frontend (.env.local)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay public key ID.

## Backend (.env)
- `PORT`: Server port (default: 5000).
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (CRITICAL: Never expose to frontend).
- `RAZORPAY_KEY_ID`: Razorpay key ID.
- `RAZORPAY_KEY_SECRET`: Razorpay secret key.
- `CLAUDE_API_KEY`: Anthropic Claude API key.
- `REDIS_URL`: Redis connection string for BullMQ.
- `JWT_SECRET`: Secret for signing JWT tokens.
