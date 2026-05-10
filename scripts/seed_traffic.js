const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

const fakeUsers = [
  { username: 'AlphaShadow', id: '11111111-1111-1111-1111-111111111111' },
  { username: 'ChaosQueen', id: '22222222-2222-2222-2222-222222222222' },
  { username: 'DareDevil_99', id: '33333333-3333-3333-3333-333333333333' },
  { username: 'RiskTaker', id: '44444444-4444-4444-4444-444444444444' },
  { username: 'CryptoBro', id: '55555555-5555-5555-5555-555555555555' }
];

const fakeComments = [
  "Just joined the pot! This is going to be insane. 💀",
  "I've seen u/AlphaShadow do this before, they're going to win for sure.",
  "Check out my proof below! I just finished the dare in under 5 minutes. 🔥",
  "The stakes are getting high... ₹900 already??",
  "LMAO u/DareDevil_99 you actually did it?? Absolute legend.",
  "Anyone else having trouble with the second part of the dare?",
  "I'm betting ₹100 on whoever posts the best video. Let's go!",
  "Proof uploaded! 🎥 Hope the community likes it.",
];

async function run() {
  // Get all dares
  const { data: dares } = await supabase.from('dares').select('id');
  if (!dares || dares.length === 0) return;

  console.log("Setting up fake users...");
  // Ensure fake users exist in auth.users and public.users
  for (const user of fakeUsers) {
    // Try to create auth user
    await supabase.auth.admin.createUser({
      email: `${user.username.toLowerCase()}@shadowbet.com`,
      password: 'password123',
      email_confirm: true,
      user_metadata: { username: user.username }
    }).catch(() => {}); // ignore if exists

    // We don't know the generated auth UUID unless we search it, wait!
    // Supabase allows us to provide a custom ID when creating a user, but only in newer versions.
    // Instead of custom IDs, let's just find the created user or fetch them.
    const { data: authData } = await supabase.auth.admin.listUsers();
    const createdAuthUser = authData.users.find(u => u.email === `${user.username.toLowerCase()}@shadowbet.com`);
    
    if (createdAuthUser) {
      user.id = createdAuthUser.id; // UPDATE ID TO REAL ONE
      await supabase.from('users').upsert({
        id: user.id,
        username: user.username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
      });
    }
  }

  for (const dare of dares) {
    const dareId = dare.id;
    console.log(`Seeding fake traffic for Dare: ${dareId}...`);

    // Add fake bets
    for (const user of fakeUsers) {
      await supabase.from('dare_bets').upsert({
        dare_id: dareId,
        user_id: user.id,
        amount_paise: Math.floor(Math.random() * 50) * 1000 + 10000
      });
    }

    // Update pot amount
    const { data: currentDare } = await supabase.from('dares').select('total_pot_paise').eq('id', dareId).single();
    const totalFakeBet = fakeUsers.length * 25000; // rough estimate
    await supabase.from('dares').update({ total_pot_paise: (currentDare?.total_pot_paise || 0) + totalFakeBet }).eq('id', dareId);

    // Add fake comments
    for (let i = 0; i < 8; i++) {
      const user = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
      const content = fakeComments[i];
      const hasMedia = Math.random() > 0.4; // Higher chance for proof
      
      await supabase.from('dare_comments').insert({
        dare_id: dareId,
        user_id: user.id,
        content: content,
        media_url: hasMedia ? `https://picsum.photos/seed/${Math.random()}/800/450` : null
      });
    }
  }

  console.log("Seeding complete! 🚀");
}

run();
