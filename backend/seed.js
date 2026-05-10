const { createClient } = require('@supabase/supabase-client');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Create a System User
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        id: '00000000-0000-0000-0000-000000000000',
        username: 'shadow_master',
        email: 'system@shadow.com',
        plan: 'shadow_plus',
        wallet_balance: 1000000
      })
      .select()
      .single();
    
    if (userError) throw userError;
    console.log('✅ System user created');

    // 2. Create Niches
    const niches = [
      { name: 'Startup Bro', emoji: '💼', color: '#6C2BD9' },
      { name: 'Creative Chaos', emoji: '🎨', color: '#EC4899' },
      { name: 'Rizz Lab', emoji: '❤️', color: '#EF4444' },
      { name: 'Gains Gang', emoji: '💪', color: '#10B981' }
    ];

    for (const niche of niches) {
      await supabase.from('niches').upsert({ ...niche, creator_id: user.id });
    }
    console.log('✅ Niches seeded');

    // 3. Get Niche IDs
    const { data: nicheData } = await supabase.from('niches').select('id, name');
    const nicheMap = Object.fromEntries(nicheData.map(n => [n.name, n.id]));

    // 4. Create Dares
    const dares = [
      {
        creator_id: user.id,
        niche_id: nicheMap['Startup Bro'],
        title: "Post your most controversial opinion on LinkedIn and tag your boss.",
        category: 'social',
        pot_amount: 45000,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        status: 'active'
      },
      {
        creator_id: user.id,
        niche_id: nicheMap['Creative Chaos'],
        title: "Recreate the Mona Lisa using only MS Paint in 5 minutes.",
        category: 'creative',
        pot_amount: 12000,
        expires_at: new Date(Date.now() + 7200000).toISOString(),
        status: 'active'
      }
    ];

    const { error: dareError } = await supabase.from('dares').insert(dares);
    if (dareError) throw dareError;
    console.log('✅ Dares seeded');

    console.log('✨ Seeding complete!');
  } catch (err) {
    console.error('❌ Error seeding:', err.message);
  }
}

seed();
