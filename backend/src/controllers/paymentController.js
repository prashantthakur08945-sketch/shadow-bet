const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../config/supabase');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount_paise, userId } = req.body;

    if (!amount_paise || amount_paise < 1000) {
      return res.status(400).json({ error: 'Minimum top-up is ₹10 (1000 paise)' });
    }

    const options = {
      amount: amount_paise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log('Razorpay Order Created:', order.id);

    // Insert pending transaction
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'topup',
        amount_paise: amount_paise,
        razorpay_order_id: order.id,
        status: 'pending'
      });

    if (txError) {
      console.error('Supabase Transaction Insert Error:', txError);
      throw txError;
    }

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Razorpay Create Order Full Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      amount_paise
    } = req.body;

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', razorpay_order_id);
        
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update Transaction
    const { error: txError } = await supabase
      .from('transactions')
      .update({ 
        status: 'success',
        razorpay_payment_id: razorpay_payment_id
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (txError) throw txError;

    // Update Wallet (Atomic)
    // We use a simple select then upsert because we are in a single-threaded node env for now 
    // but in production a stored procedure (RPC) is better for race conditions.
    const { data: wallet, error: walletFetchError } = await supabase
      .from('wallets')
      .select('balance_paise')
      .eq('user_id', userId)
      .single();

    let newBalance = amount_paise;
    if (wallet) {
      newBalance = wallet.balance_paise + amount_paise;
    }

    const { data: updatedWallet, error: walletUpdateError } = await supabase
      .from('wallets')
      .upsert({ 
        user_id: userId, 
        balance_paise: newBalance,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (walletUpdateError) throw walletUpdateError;

    res.json({ 
      success: true, 
      balance: updatedWallet.balance_paise 
    });

  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};
