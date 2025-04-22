-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DO $$
BEGIN
    -- Check if policy exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Images are publicly accessible'
    ) THEN
        CREATE POLICY "Images are publicly accessible"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can upload their own images'
    ) THEN
        CREATE POLICY "Users can upload their own images"
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = 'images' AND
            auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can update their own images'
    ) THEN
        CREATE POLICY "Users can update their own images"
        ON storage.objects FOR UPDATE
        USING (
            bucket_id = 'images' AND
            auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can delete their own images'
    ) THEN
        CREATE POLICY "Users can delete their own images"
        ON storage.objects FOR DELETE
        USING (
            bucket_id = 'images' AND
            auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END
$$; 