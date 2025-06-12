# 🔧 SnapSave Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. **"File upload section not showing"**

**Problem**: After selecting "Photo" or "Video", you don't see where to upload files.

**Solution**: 
- Make sure you've selected a content type from the dropdown
- Check browser console (F12) for any JavaScript errors
- The file upload section should appear below the dropdown

**What you should see**:
- A "📁 Choose File to Upload:" label
- A file input button
- A preview area with upload icon

### 2. **"Database not set up" error**

**Problem**: App shows "Database not set up" notification.

**Solution**:
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database-setup.sql`
4. Click **Run** to execute all commands

### 3. **"Failed to save content" error**

**Problem**: Files or content won't save.

**Solution**:
1. **Check storage bucket**:
   - Go to Supabase → Storage
   - Create bucket named `snapsave-files`
   - Make it **Public**

2. **Check storage policies**:
   - Run the storage policies from `database-setup.sql`

3. **Check file size**:
   - Supabase has file size limits
   - Try with a smaller file first

### 4. **"No content found" when accessing**

**Problem**: Entering password shows no content.

**Solution**:
- Make sure you're using the same 2-digit password you used when saving
- Check that content was saved successfully (should show success message)
- Try saving new content first, then access it

### 5. **App not loading properly**

**Problem**: Page shows errors or doesn't work.

**Solution**:
1. **Check Supabase credentials**:
   - Open `script.js`
   - Verify URL and key are correct
   - Should look like: `https://your-project.supabase.co`

2. **Check browser console**:
   - Press F12 to open developer tools
   - Look for red error messages
   - Share any errors you see

## 🧪 Testing Steps

### Test 1: Basic Functionality
1. Open the app in browser
2. You should see "SnapSave is ready to use!" message
3. If not, check console for errors

### Test 2: File Upload
1. Click "Add New"
2. Select "Photo" from dropdown
3. You should see file upload section appear
4. Click "Choose File" and select an image
5. Enter a 2-digit password (e.g., "12")
6. Click "Save Content"

### Test 3: Access Content
1. Click "Enter Code"
2. Enter the same password you used ("12")
3. Click "Access Content"
4. You should see your saved photo

## 🔍 Debug Information

### Check Console Logs
1. Press F12 in browser
2. Go to **Console** tab
3. Look for these messages:
   - ✅ "Testing Supabase connection..."
   - ✅ "Supabase connection successful!"
   - ❌ Any red error messages

### Test Database Connection
1. Go to Supabase dashboard
2. Navigate to **Table Editor**
3. You should see `snapsave_content` table
4. If not, run the database setup

### Test Storage
1. Go to Supabase → Storage
2. You should see `snapsave-files` bucket
3. If not, create it manually

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Check the console** (F12) and share any error messages
2. **Verify your Supabase setup**:
   - Project is active
   - Database table exists
   - Storage bucket exists
   - Policies are set correctly

3. **Try a simple test**:
   - Save a text note first (easiest to test)
   - Then try file uploads

4. **Common mistakes**:
   - Forgetting to create the storage bucket
   - Not setting storage policies
   - Using wrong Supabase credentials
   - Not running the database setup SQL

---

**Need more help?** Check the main README.md for detailed setup instructions! 