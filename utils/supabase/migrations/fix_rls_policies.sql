-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.conversation_history;
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own role" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own or all messages if admin" ON public.conversation_history;
DROP POLICY IF EXISTS "Users can view own or all trades if admin" ON public.trades;
DROP POLICY IF EXISTS "Users can view own or all profiles if admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;

-- Create a function to check if a user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND user_role = 'admin'::user_role
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Create base profile policy (this needs to come first)
CREATE POLICY "Enable read access for users to their own profile"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid()
  OR (SELECT auth.is_admin())
);

-- Create policy for profile updates
CREATE POLICY "Enable update for users to their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Create policies for conversation_history
CREATE POLICY "Enable read access for users to their own messages or all if admin"
ON public.conversation_history
FOR SELECT
USING (
  user_id = auth.uid()
  OR (SELECT auth.is_admin())
);

-- Create policies for trades
CREATE POLICY "Enable read access for users to their own trades or all if admin"
ON public.trades
FOR SELECT
USING (
  user_id = auth.uid()
  OR (SELECT auth.is_admin())
);
