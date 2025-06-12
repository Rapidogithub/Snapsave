-- SnapSave Database Setup
-- Run these commands in your Supabase SQL Editor

-- 1. Create the content table
CREATE TABLE IF NOT EXISTS snapsave_content (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL,
    password VARCHAR(2) NOT NULL,
    content TEXT NOT NULL,
    fileName VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_snapsave_password ON snapsave_content(password);
CREATE INDEX IF NOT EXISTS idx_snapsave_timestamp ON snapsave_content(timestamp);

-- 3. Enable RLS on the table
ALTER TABLE snapsave_content ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for the content table
-- Allow all operations (since we're using simple 2-digit passwords)
CREATE POLICY "Allow all operations on snapsave_content" ON snapsave_content
FOR ALL USING (true) WITH CHECK (true);

-- 5. Create storage bucket (run this in Storage section)
-- Go to Storage → Create bucket → Name: "snapsave-files" → Public bucket

-- 6. Set storage policies (run these in SQL Editor)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;

-- Allow public read access to files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'snapsave-files');

-- Allow authenticated uploads (using anon key)
CREATE POLICY "Authenticated Uploads" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'snapsave-files');

-- Allow authenticated updates
CREATE POLICY "Authenticated Updates" ON storage.objects FOR UPDATE
USING (bucket_id = 'snapsave-files');

-- Allow authenticated deletes
CREATE POLICY "Authenticated Deletes" ON storage.objects FOR DELETE
USING (bucket_id = 'snapsave-files');

-- 7. Test the setup
SELECT 'Database setup complete!' as status; 