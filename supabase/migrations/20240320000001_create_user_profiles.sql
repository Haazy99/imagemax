-- Create enum types for theme and language
CREATE TYPE public.user_theme AS ENUM ('light', 'dark', 'system');
CREATE TYPE public.user_language AS ENUM ('en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko');

-- Create user_profiles table with improved constraints
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    location TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT full_name_length CHECK (char_length(full_name) >= 2 AND char_length(full_name) <= 100),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 500),
    CONSTRAINT location_length CHECK (char_length(location) <= 100)
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    theme public.user_theme DEFAULT 'system' NOT NULL,
    language public.user_language DEFAULT 'en' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_deleted ON public.user_profiles;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into user_profiles
    INSERT INTO public.user_profiles (
        id,
        full_name,
        avatar_url
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- Insert into user_settings with defaults
    INSERT INTO public.user_settings (
        user_id,
        theme,
        language
    )
    VALUES (
        NEW.id,
        'system'::public.user_theme,
        'en'::public.user_language
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle profile deletion
CREATE OR REPLACE FUNCTION public.handle_profile_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Clean up user settings
    DELETE FROM public.user_settings WHERE user_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile deletion
CREATE TRIGGER on_profile_deleted
    AFTER DELETE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_profile_deletion();

-- Add comments
COMMENT ON TABLE public.user_profiles IS 'Stores user profile information including name, location, bio, and avatar URL';
COMMENT ON TABLE public.user_settings IS 'Stores user preferences including theme and language settings';

COMMENT ON COLUMN public.user_profiles.id IS 'References the auth.users table';
COMMENT ON COLUMN public.user_profiles.full_name IS 'User''s full name (2-100 characters)';
COMMENT ON COLUMN public.user_profiles.location IS 'User''s location (max 100 characters)';
COMMENT ON COLUMN public.user_profiles.bio IS 'User''s biography (max 500 characters)';
COMMENT ON COLUMN public.user_profiles.avatar_url IS 'URL to user''s avatar image';
COMMENT ON COLUMN public.user_profiles.created_at IS 'Timestamp when the profile was created';
COMMENT ON COLUMN public.user_profiles.updated_at IS 'Timestamp when the profile was last updated';

COMMENT ON COLUMN public.user_settings.user_id IS 'References the user_profiles table';
COMMENT ON COLUMN public.user_settings.theme IS 'User''s preferred theme (light/dark/system)';
COMMENT ON COLUMN public.user_settings.language IS 'User''s preferred language';
COMMENT ON COLUMN public.user_settings.created_at IS 'Timestamp when the settings were created';
COMMENT ON COLUMN public.user_settings.updated_at IS 'Timestamp when the settings were last updated'; 