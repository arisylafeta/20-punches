import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types_db';

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function clearTestCustomers() {
  try {
    const { error } = await supabaseAdmin
      .from('customers')
      .delete()
      .not('stripe_customer_id', 'like', 'cus_live%');
    
    if (error) {
      console.error('Error clearing test customers:', error);
      process.exit(1);
    }
    
    console.log('Successfully cleared test customers');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearTestCustomers();
