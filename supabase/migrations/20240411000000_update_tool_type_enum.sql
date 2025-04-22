-- Update tool_type enum to replace 'compression' with 'upscaler'
-- First, remove the default value from the column
ALTER TABLE public.processed_images ALTER COLUMN tool_type DROP DEFAULT;

-- Create a new enum type with the updated values
CREATE TYPE tool_type_new AS ENUM ('background-removal', 'enhancement', 'upscaler', 'format-conversion');

-- Update the processed_images table to use the new enum type
ALTER TABLE public.processed_images 
  ALTER COLUMN tool_type TYPE tool_type_new 
  USING CASE 
    WHEN tool_type::text = 'compression' THEN 'upscaler'::tool_type_new
    ELSE tool_type::text::tool_type_new
  END;

-- Update the tool_usage table to use the new enum type
ALTER TABLE public.tool_usage 
  ALTER COLUMN tool_type TYPE tool_type_new 
  USING CASE 
    WHEN tool_type::text = 'compression' THEN 'upscaler'::tool_type_new
    ELSE tool_type::text::tool_type_new
  END;

-- Drop the old enum type with CASCADE to handle any remaining dependencies
DROP TYPE tool_type CASCADE;

-- Rename the new enum type to the original name
ALTER TYPE tool_type_new RENAME TO tool_type;

-- Add back the default value with the new enum type
ALTER TABLE public.processed_images ALTER COLUMN tool_type SET DEFAULT 'background-removal'::tool_type; 