import { getUser } from '@/lib/db/users';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count, error } = await supabase
    .from('monthly_message_counts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch count' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ count: count || 0 }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
