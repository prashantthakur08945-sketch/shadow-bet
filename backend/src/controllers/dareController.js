const supabase = require('../config/supabase');

exports.getFeed = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dares')
      .select('*, creator:creator_id(username, avatar_url), niche:niche_id(name, emoji)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Feed Error:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
};

exports.createDare = async (req, res) => {
  const { creatorId, title, category, potAmount, nicheId, expiresAt } = req.body;

  try {
    const { data, error } = await supabase
      .from('dares')
      .insert({
        creator_id: creatorId,
        title,
        category,
        pot_amount: potAmount,
        niche_id: nicheId,
        expires_at: expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour default
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create Dare Error:', error);
    res.status(500).json({ error: 'Failed to create dare' });
  }
};
