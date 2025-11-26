import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnxqyltjbcwqwblnhuhm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueHF5bHRqYmN3cXdibG5odWhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk2NzY5NCwiZXhwIjoyMDc5NTQzNjk0fQ.THfAkq_i0eFEnBqtd22n6ZdNZyKnldve_d2rl88e6_w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCoins() {
  const userId = 'fc7fb9f2-6bb8-4d42-9fb9-599f7196e941';
  
  // Add 200 coins to user
  const { data, error } = await supabase
    .from('users')
    .update({ coins: 200 })
    .eq('id', userId)
    .select();
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Coins updated:', data);
  }
}

addCoins();
