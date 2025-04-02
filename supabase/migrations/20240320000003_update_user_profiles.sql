-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    location TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Update user_profiles table if needed
DO $$ 
BEGIN
    -- Add location column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN location TEXT;
    END IF;

    -- Add bio column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN bio TEXT;
    END IF;
END $$;

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into user_profiles with all available data from Google Auth
    INSERT INTO public.user_profiles (
        id,
        full_name,
        location,
        bio,
        avatar_url
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'location',
        NEW.raw_user_meta_data->>'bio',
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        location = EXCLUDED.location,
        bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = TIMEZONE('utc'::text, NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create or replace function to sync profile updates
CREATE OR REPLACE FUNCTION public.sync_profile_updates()
RETURNS TRIGGER AS $$
BEGIN
    -- Update auth user metadata when profile is updated
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{full_name}',
        to_jsonb(NEW.full_name)
    )
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS on_profile_updated ON public.user_profiles;
CREATE TRIGGER on_profile_updated
    AFTER UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_profile_updates();

-- Update RLS policies if needed
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

    -- Create updated policies
    CREATE POLICY "Users can view their own profile"
        ON public.user_profiles FOR SELECT
        USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile"
        ON public.user_profiles FOR UPDATE
        USING (auth.uid() = id);

    CREATE POLICY "Users can insert their own profile"
        ON public.user_profiles FOR INSERT
        WITH CHECK (auth.uid() = id);
END $$;

-- Create function to handle profile deletion
CREATE OR REPLACE FUNCTION public.handle_profile_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Clean up any associated data
    DELETE FROM public.user_settings WHERE user_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile deletion
DROP TRIGGER IF EXISTS on_profile_deleted ON public.user_profiles;
CREATE TRIGGER on_profile_deleted
    AFTER DELETE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_profile_deletion();

-- Add comment to table
COMMENT ON TABLE public.user_profiles IS 'Stores user profile information including name, location, bio, and avatar URL';

-- Add comments to columns
COMMENT ON COLUMN public.user_profiles.id IS 'References the auth.users table';
COMMENT ON COLUMN public.user_profiles.full_name IS 'User''s full name';
COMMENT ON COLUMN public.user_profiles.location IS 'User''s location';
COMMENT ON COLUMN public.user_profiles.bio IS 'User''s biography';
COMMENT ON COLUMN public.user_profiles.avatar_url IS 'URL to user''s avatar image';
COMMENT ON COLUMN public.user_profiles.created_at IS 'Timestamp when the profile was created';
COMMENT ON COLUMN public.user_profiles.updated_at IS 'Timestamp when the profile was last updated'; 