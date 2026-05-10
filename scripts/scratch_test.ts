
import { createClient } from './src/utils/supabase/client';

const supabase = createClient();

async function test() {
  const { data, error } = await supabase.from('dare_comments').select('*').limit(1);
  console.log('Result:', { data, error });
}

test();
