-- Add policies for analytics access to conversation_history
ALTER TABLE IF EXISTS public.conversation_history ENABLE ROW LEVEL SECURITY;

-- Allow admin users to view all conversation history
CREATE POLICY "Admin users can view all conversation history"
ON public.conversation_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Add policies for analytics access to trades
ALTER TABLE IF EXISTS public.trades ENABLE ROW LEVEL SECURITY;

-- Allow admin users to view all trades
CREATE POLICY "Admin users can view all trades"
ON public.trades
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
