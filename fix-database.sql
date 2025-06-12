-- Fix for missing fileName column
-- Run this in your Supabase SQL Editor

-- Add the missing fileName column
ALTER TABLE snapsave_content 
ADD COLUMN IF NOT EXISTS fileName VARCHAR(255);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'snapsave_content';

-- Test the fix
SELECT 'Database fixed successfully!' as status; 