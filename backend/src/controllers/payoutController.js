const supabase = require('../config/supabase');

exports.submitProof = async (req, res) => {
  try {
    const { dare_id, userId, proof_url } = req.body;

    if (!dare_id || !userId || !proof_url) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // Update dare with proof and set status to voting
    const { error } = await supabase
      .from('dares')
      .update({ 
        proof_url, 
        status: 'completed', // Using 'completed' as trigger for voting in this UI
        updated_at: new Date()
      })
      .eq('id', dare_id)
      .eq('creator_id', userId); // Only creator can submit proof

    if (error) throw error;

    res.json({ success: true, message: 'Proof submitted for community review! 💀' });
  } catch (error) {
    console.error('Proof Submission Error:', error);
    res.status(500).json({ error: 'Failed to submit proof' });
  }
};

exports.castVote = async (req, res) => {
  try {
    const { dare_id, userId, vote_type } = req.body; // 'complete' or 'fail'

    if (!dare_id || !userId || !vote_type) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const { error } = await supabase
      .from('dare_votes')
      .upsert({
        dare_id,
        user_id: userId,
        vote_type,
        created_at: new Date()
      }, { onConflict: 'dare_id,user_id' });

    if (error) throw error;

    // Increment vote count on dare
    const column = vote_type === 'complete' ? 'votes_complete' : 'votes_fail';
    const { data: dare } = await supabase.from('dares').select(column).eq('id', dare_id).single();
    
    await supabase.from('dares').update({ [column]: (dare[column] || 0) + 1 }).eq('id', dare_id);

    res.json({ success: true, message: 'Vote recorded!' });
  } catch (error) {
    console.error('Voting Error:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
};

exports.processPayout = async (req, res) => {
  try {
    const { dare_id } = req.body;

    // 1. Fetch Dare and Bets
    const { data: dare, error: dareError } = await supabase
      .from('dares')
      .select('*')
      .eq('id', dare_id)
      .single();

    if (dareError || !dare) throw new Error('Dare not found');

    const { data: bets, error: betsError } = await supabase
      .from('dare_bets')
      .select('*, user:users(id)')
      .eq('dare_id', dare_id);

    if (betsError) throw betsError;

    // 2. Logic: If votes_complete > votes_fail -> Payout
    const isSuccess = (dare.votes_complete || 0) >= (dare.votes_fail || 0);
    const totalPot = dare.total_pot_paise || 0;
    
    if (isSuccess && totalPot > 0) {
      const platformCut = Math.floor(totalPot * 0.1);
      const distributablePot = totalPot - platformCut;
      
      // For simplicity, payout goes to the creator (the one who did the dare)
      // OR distribute among winners? Usually creators get the bounty.
      const winners = [dare.creator_id]; // Single winner logic for now
      const share = Math.floor(distributablePot / winners.length);

      for (const winnerId of winners) {
        // Increment wallet
        const { data: wallet } = await supabase.from('wallets').select('balance_paise').eq('user_id', winnerId).single();
        await supabase.from('wallets').update({ balance_paise: (wallet?.balance_paise || 0) + share }).eq('user_id', winnerId);
        
        // Log transaction
        await supabase.from('transactions').insert({
          user_id: winnerId,
          type: 'payout_win',
          amount_paise: share,
          dare_id: dare_id,
          status: 'success'
        });
      }

      // Log platform cut
      await supabase.from('transactions').insert({
        user_id: dare.creator_id, // Logged against creator for tracking
        type: 'platform_cut',
        amount_paise: platformCut,
        dare_id: dare_id,
        status: 'success'
      });
    }

    // 3. Mark dare as settled/expired
    await supabase.from('dares').update({ status: isSuccess ? 'completed' : 'failed' }).eq('id', dare_id);

    res.json({ success: true, settled: true, winner: isSuccess });
  } catch (error) {
    console.error('Payout Error:', error);
    res.status(500).json({ error: 'Failed to process payout' });
  }
};
