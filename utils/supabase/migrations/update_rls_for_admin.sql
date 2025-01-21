-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.conversation_history;
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own role" ON public.profiles;

-- Create new policies for conversation_history
CREATE POLICY "Users can view own or all messages if admin"
ON public.conversation_history
FOR SELECT
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_role = 'admin'
    )
);

-- Create new policies for trades
CREATE POLICY "Users can view own or all trades if admin"
ON public.trades
FOR SELECT
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_role = 'admin'
    )
);

-- Create new policies for profiles
CREATE POLICY "Users can view own or all profiles if admin"
ON public.profiles
FOR SELECT
USING (
    id = auth.uid() 
    OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_role = 'admin'
    )
);

-- Users can only update their own profile (keeping this restricted)
CREATE POLICY "Users can update own profile only"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);
