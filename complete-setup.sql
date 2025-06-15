-- Complete SnapSave Database Setup for New Supabase Project
-- Run this entire file in your Supabase SQL Editor
-- URL: https://gpirddziozadnnvzsbhy.supabase.co

-- =====================================================
-- 1. CREATE THE MAIN CONTENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS snapsave_content (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL,
    password VARCHAR(2) NOT NULL,
    content TEXT NOT NULL,
    fileName VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_snapsave_password ON snapsave_content(password);
CREATE INDEX IF NOT EXISTS idx_snapsave_timestamp ON snapsave_content(timestamp);
CREATE INDEX IF NOT EXISTS idx_snapsave_type ON snapsave_content(type);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE snapsave_content ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES FOR CONTENT TABLE
-- =====================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on snapsave_content" ON snapsave_content;
DROP POLICY IF EXISTS "Public read access" ON snapsave_content;
DROP POLICY IF EXISTS "Public insert access" ON snapsave_content;
DROP POLICY IF EXISTS "Public update access" ON snapsave_content;
DROP POLICY IF EXISTS "Public delete access" ON snapsave_content;

-- Create comprehensive policies for all operations
CREATE POLICY "Allow all operations on snapsave_content" ON snapsave_content
FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 5. CREATE STORAGE BUCKET (if not exists)
-- =====================================================
-- Note: This bucket should be created in the Storage section of Supabase dashboard
-- Go to Storage → Create bucket → Name: "snapsave-files" → Public bucket
-- The SQL below sets up the policies for the bucket

-- =====================================================
-- 6. SET UP STORAGE POLICIES
-- =====================================================
-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Updates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'snapsave-files');

CREATE POLICY "Authenticated Uploads" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'snapsave-files');

CREATE POLICY "Authenticated Updates" ON storage.objects FOR UPDATE
USING (bucket_id = 'snapsave-files');

CREATE POLICY "Authenticated Deletes" ON storage.objects FOR DELETE
USING (bucket_id = 'snapsave-files');

-- =====================================================
-- 7. CREATE ADDITIONAL HELPER FUNCTIONS
-- =====================================================
-- Function to clean up old content (optional)
CREATE OR REPLACE FUNCTION cleanup_old_content(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM snapsave_content 
    WHERE timestamp < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. CREATE VIEWS FOR BETTER DATA ACCESS
-- =====================================================
-- View for recent content
CREATE OR REPLACE VIEW recent_content AS
SELECT 
    id,
    type,
    password,
    LEFT(content, 100) as content_preview,
    fileName,
    timestamp
FROM snapsave_content 
ORDER BY timestamp DESC;

-- =====================================================
-- 9. SET UP AUTOMATIC CLEANUP (OPTIONAL)
-- =====================================================
-- Uncomment the line below if you want automatic cleanup of old content
-- SELECT cron.schedule('cleanup-old-content', '0 2 * * *', 'SELECT cleanup_old_content(30);');

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================
-- Test the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'snapsave_content'
ORDER BY ordinal_position;

-- Test RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'snapsave_content';

-- Test storage policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- =====================================================
-- 11. FINAL SETUP CONFIRMATION
-- =====================================================
SELECT 
    'SnapSave Database Setup Complete!' as status,
    COUNT(*) as table_count,
    'snapsave_content' as main_table
FROM information_schema.tables 
WHERE table_name = 'snapsave_content';

-- =====================================================
-- MANUAL STEPS REQUIRED:
-- =====================================================
-- 1. Go to Storage section in Supabase dashboard
-- 2. Create a new bucket named "snapsave-files"
-- 3. Set the bucket to "Public"
-- 4. Test the application with your new credentials
-- ===================================================== 