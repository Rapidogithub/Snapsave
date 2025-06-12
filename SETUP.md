# 🚀 SnapSave Quick Setup Guide

## Step 1: Supabase Setup (5 minutes)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project" → Sign up
   - Create a new project

2. **Get API Keys**
   - In your project dashboard, go to **Settings** → **API**
   - Copy the **Project URL** and **anon public** key

3. **Update script.js**
   - Open `script.js` in your code editor
   - Replace these lines:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
   - With your actual values from step 2

## Step 2: Database Setup (3 minutes)

1. **Create Table**
   - In Supabase dashboard, go to **SQL Editor**
   - Run this command:
   ```sql
   CREATE TABLE snapsave_content (
       id SERIAL PRIMARY KEY,
       type VARCHAR(10) NOT NULL,
       password VARCHAR(2) NOT NULL,
       content TEXT NOT NULL,
       fileName VARCHAR(255),
       timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Create Storage**
   - Go to **Storage** in dashboard
   - Click **Create bucket**
   - Name it: `snapsave-files`
   - Make it **Public**

## Step 3: Run the App (1 minute)

1. **Local Testing**
   - Open `index.html` in your browser
   - Or use a simple server:
   ```bash
   # Windows (PowerShell)
   
   
   # Then open: http://localhost:8000
   ```

## ✅ Done!

Your SnapSave app is now ready to use!

- **Add content**: Upload photos, videos, save URLs and text
- **Access content**: Enter your 2-digit password from any device
- **Works everywhere**: Mobile, desktop, any browser

## 🔧 Troubleshooting

**"Please configure Supabase credentials"**
- Make sure you updated the URL and key in `script.js`

**"Failed to save content"**
- Check that you created the storage bucket named `snapsave-files`
- Make sure the bucket is set to public

**Files not uploading**
- Check browser console (F12) for error messages
- Verify your Supabase project is active

---

**Need help?** Check the full README.md for detailed instructions! 