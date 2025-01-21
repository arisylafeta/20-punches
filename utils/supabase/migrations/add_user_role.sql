-- Add user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add user_role column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_role user_role NOT NULL DEFAULT 'user';

-- Update RLS policy to allow users to view their own role
CREATE POLICY "Users can view own role"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to see their own role in their profile
COMMENT ON COLUMN public.profiles.user_role IS 'Role of the user - can be either user or admin';

-- Create function to set initial admin user if needed
CREATE OR REPLACE FUNCTION set_admin_user(admin_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET user_role = 'admin'
    WHERE email = admin_email;
END;
$$ LANGUAGE plpgsql;
