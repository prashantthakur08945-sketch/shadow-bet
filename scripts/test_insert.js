const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testInsert() {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: 'd6b7975a-7975-4a5d-bfb7-b2036965c892', // A random valid UUID for testing
      type: 'topup',
      amount_paise: 1000,
      razorpay_order_id: 'test_order_id',
      status: 'pending'
    });
  
  if (error) {
    console.error('Insert failed with error:', error);
  } else {
    console.log('Insert successful');
  }
}

testInsert();
