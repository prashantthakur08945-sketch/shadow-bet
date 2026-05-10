const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectTable() {
  const { data, error } = await supabase.from('transactions').select('*').limit(1);
  if (error) {
    console.error('Error selecting from transactions:', error);
  } else {
    console.log('Transactions columns:', data.length > 0 ? Object.keys(data[0]) : 'No rows to inspect columns');
  }
}

inspectTable();
