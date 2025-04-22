-- Add storage quota fields to profiles table
ALTER TABLE profiles
ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'free',
ADD COLUMN storage_used BIGINT NOT NULL DEFAULT 0,
ADD COLUMN last_cleanup TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX idx_profiles_storage_used ON profiles(storage_used);

-- Add function to update storage usage
CREATE OR REPLACE FUNCTION update_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET storage_used = storage_used + COALESCE(NEW.original_size, 0) + COALESCE(NEW.processed_size, 0)
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET storage_used = storage_used - COALESCE(OLD.original_size, 0) - COALESCE(OLD.processed_size, 0)
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for storage usage updates
CREATE TRIGGER update_storage_usage_trigger
AFTER INSERT OR DELETE ON processed_images
FOR EACH ROW
EXECUTE FUNCTION update_storage_usage();

-- Add cleanup function with error handling
CREATE OR REPLACE FUNCTION cleanup_old_files()
RETURNS TABLE (
  success boolean,
  message text,
  deleted_count integer,
  errors jsonb
) AS $$
DECLARE
  cutoff_date TIMESTAMP WITH TIME ZONE;
  old_files RECORD;
  deleted_count integer := 0;
  error_count integer := 0;
  error_messages jsonb := '[]'::jsonb;
BEGIN
  cutoff_date := NOW() - INTERVAL '7 days';
  
  FOR old_files IN
    SELECT id, original_url, processed_url, user_id
    FROM processed_images
    WHERE created_at < cutoff_date
  LOOP
    BEGIN
      -- Delete from storage
      IF old_files.original_url IS NOT NULL THEN
        DELETE FROM storage.objects WHERE name = old_files.original_url;
      END IF;
      IF old_files.processed_url IS NOT NULL THEN
        DELETE FROM storage.objects WHERE name = old_files.processed_url;
      END IF;
      
      -- Delete from database
      DELETE FROM processed_images WHERE id = old_files.id;
      
      -- Update last cleanup time
      UPDATE profiles
      SET last_cleanup = NOW()
      WHERE id = old_files.user_id;
      
      deleted_count := deleted_count + 1;
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := error_messages || jsonb_build_object(
        'file_id', old_files.id,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  IF deleted_count > 0 THEN
    RETURN QUERY SELECT 
      true as success,
      format('Cleaned up %s files', deleted_count) as message,
      deleted_count as deleted_count,
      CASE WHEN error_count > 0 THEN error_messages ELSE NULL END as errors;
  ELSE
    RETURN QUERY SELECT 
      error_count = 0 as success,
      CASE 
        WHEN error_count > 0 THEN format('Failed to clean up %s files', error_count)
        ELSE 'No files to clean up'
      END as message,
      0 as deleted_count,
      CASE WHEN error_count > 0 THEN error_messages ELSE NULL END as errors;
  END IF;
END;
$$ LANGUAGE plpgsql; 