-- Quick Fix for SnapSave RLS Issues
-- Run this in your Supabase SQL Editor to fix the 403 errors

-- 1. Enable RLS on the content table
ALTER TABLE snapsave_content ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies
DROP POLICY IF EXISTS "Allow all operations on snapsave_content" ON snapsave_content;

-- 3. Create a permissive policy for the content table
CREATE POLICY "Allow all operations on snapsave_content" ON snapsave_content
FOR ALL USING (true) WITH CHECK (true);

-- 4. Fix storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Updates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Deletes" ON storage.objects;

-- 5. Create new storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'snapsave-files');

CREATE POLICY "Authenticated Uploads" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'snapsave-files');

CREATE POLICY "Authenticated Updates" ON storage.objects FOR UPDATE
USING (bucket_id = 'snapsave-files');

CREATE POLICY "Authenticated Deletes" ON storage.objects FOR DELETE
USING (bucket_id = 'snapsave-files');

-- 6. Verify the fix
SELECT 'Quick fix applied successfully!' as status; 