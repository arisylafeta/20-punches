-- Disable RLS for conversation_history
ALTER TABLE IF EXISTS public.conversation_history DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies on conversation_history
DROP POLICY IF EXISTS "Admin users can view all conversation history" ON public.conversation_history;

-- Disable RLS for trades
ALTER TABLE IF EXISTS public.trades DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies on trades
DROP POLICY IF EXISTS "Admin users can view all trades" ON public.trades;
