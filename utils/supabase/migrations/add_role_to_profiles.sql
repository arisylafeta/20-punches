-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create an enum type for roles (optional, but recommended)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
        
        -- Alter the column to use the enum type
        ALTER TABLE public.profiles 
        ALTER COLUMN role TYPE user_role USING role::user_role;
        
        -- Set the default value
        ALTER TABLE public.profiles 
        ALTER COLUMN role SET DEFAULT 'user'::user_role;
    END IF;
END $$;
