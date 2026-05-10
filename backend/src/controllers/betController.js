const supabase = require('../config/supabase');

exports.enterBet = async (req, res) => {
  try {
    const { dare_id, userId, amount_paise } = req.body;

    if (!dare_id || !userId || amount_paise === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 1. Fetch Fresh Wallet Balance (Server-side check)
    const TEST_USER_ID = '6a634726-babe-465b-907d-7f44a8735806';
    if (amount_paise > 0 && userId !== TEST_USER_ID) {
      const { data: wallet, error: walletFetchError } = await supabase
        .from('wallets')
        .select('balance_paise')
        .eq('user_id', userId)
        .single();

      if (walletFetchError || !wallet || wallet.balance_paise < amount_paise) {
        return res.status(400).json({ error: 'Insufficient balance in your shadow wallet' });
      }
      
      // Deduct balance
      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({ balance_paise: wallet.balance_paise - amount_paise })
        .eq('user_id', userId)
        .gte('balance_paise', amount_paise);

      if (walletUpdateError) throw walletUpdateError;
    }

    // 4. Insert Bet Record
    const { error: betError } = await supabase
      .from('dare_bets')
      .insert({
        dare_id,
        user_id: userId,
        amount_paise,
        status: 'active'
      });

    if (betError) throw betError;

    // 5. Update Dare Total Pot
    const { data: dare, error: dareError } = await supabase
      .from('dares')
      .select('total_pot_paise')
      .eq('id', dare_id)
      .single();

    if (dareError) throw dareError;

    const { error: dareUpdateError } = await supabase
      .from('dares')
      .update({ total_pot_paise: (dare.total_pot_paise || 0) + amount_paise })
      .eq('id', dare_id);

    if (dareUpdateError) throw dareUpdateError;

    // 6. Insert Transaction Record
    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'bet_entry',
        amount_paise,
        dare_id,
        status: 'success'
      });

    // 7. Insert into Leaderboard (Upsert)
    await supabase
      .from('dare_leaderboard_entries')
      .upsert({
        dare_id,
        user_id: userId,
        amount_paise,
        status: 'active'
      }, { onConflict: 'dare_id,user_id' });

    res.json({ 
      success: true, 
      message: 'You have entered the Arena 💀',
      new_wallet_balance: 0, // Fallback for test mode
      new_pot_total: (dare?.total_pot_paise || 0) + amount_paise
    });

  } catch (error) {
    console.error('Arena Entry Full Error:', error);
    res.status(500).json({ error: error.message || 'System failure entering the Arena' });
  }
};
