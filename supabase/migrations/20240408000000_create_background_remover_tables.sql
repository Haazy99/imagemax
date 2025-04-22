-- Create enum for tool types
CREATE TYPE tool_type AS ENUM ('background-removal', 'enhancement', 'compression', 'format-conversion');

-- Create enum for processing status
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create processed_images table
CREATE TABLE IF NOT EXISTS public.processed_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_image_url TEXT NOT NULL,
    processed_image_url TEXT NOT NULL,
    tool_type tool_type NOT NULL DEFAULT 'background-removal',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER,
    image_metadata JSONB DEFAULT '{}'::jsonb,
    status processing_status DEFAULT 'pending',
    error_message TEXT,
    processing_duration INTEGER -- in milliseconds
);

-- Create tool_usage table
CREATE TABLE IF NOT EXISTS public.tool_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_type tool_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    processing_time INTEGER, -- in milliseconds
    request_metadata JSONB DEFAULT '{}'::jsonb -- Store additional request info like file size, format, etc.
);

-- Create indexes for better query performance
CREATE INDEX idx_processed_images_user_id ON public.processed_images(user_id);
CREATE INDEX idx_processed_images_tool_type ON public.processed_images(tool_type);
CREATE INDEX idx_processed_images_created_at ON public.processed_images(created_at);
CREATE INDEX idx_processed_images_status ON public.processed_images(status);

CREATE INDEX idx_tool_usage_user_id ON public.tool_usage(user_id);
CREATE INDEX idx_tool_usage_tool_type ON public.tool_usage(tool_type);
CREATE INDEX idx_tool_usage_created_at ON public.tool_usage(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.processed_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for processed_images
CREATE POLICY "Users can view their own processed images"
    ON public.processed_images
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own processed images"
    ON public.processed_images
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own processed images"
    ON public.processed_images
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own processed images"
    ON public.processed_images
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for tool_usage
CREATE POLICY "Users can view their own tool usage"
    ON public.tool_usage
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool usage"
    ON public.tool_usage
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_processed_images_updated_at
    BEFORE UPDATE ON public.processed_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to check user quota and limits
CREATE OR REPLACE FUNCTION check_user_tool_quota()
RETURNS TRIGGER AS $$
DECLARE
    daily_count INTEGER;
    max_daily_limit INTEGER := 50; -- Can be adjusted based on user tier
BEGIN
    -- Count today's usage for the user
    SELECT COUNT(*)
    INTO daily_count
    FROM public.tool_usage
    WHERE user_id = NEW.user_id
    AND tool_type = NEW.tool_type
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

    IF daily_count >= max_daily_limit THEN
        RAISE EXCEPTION 'Daily usage limit exceeded for this tool';
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for quota checking
CREATE TRIGGER check_tool_usage_quota
    BEFORE INSERT ON public.tool_usage
    FOR EACH ROW
    EXECUTE FUNCTION check_user_tool_quota();

-- Add comments for documentation
COMMENT ON TABLE public.processed_images IS 'Stores information about processed images including background removal results';
COMMENT ON TABLE public.tool_usage IS 'Tracks usage of different image processing tools by users';
COMMENT ON COLUMN public.processed_images.settings IS 'JSON settings used for the image processing';
COMMENT ON COLUMN public.processed_images.image_metadata IS 'Technical metadata about the processed image';
COMMENT ON COLUMN public.tool_usage.request_metadata IS 'Additional metadata about the processing request'; 