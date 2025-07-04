# 📱 SnapSave - Quick Cross-Device Storage

A modern web application that allows users to quickly save and access content across devices using just a 2-digit password.

## ✨ Features

- **📸 Photo Upload**: Upload and store images
- **🎥 Video Upload**: Upload and store videos  
- **🔗 URL Storage**: Save important links
- **📝 Text Notes**: Store quick notes and text
- **🔐 2-Digit Access**: Simple 2-digit password system (00-99)
- **🌐 Cross-Device**: Access your content from any device
- **📱 Responsive**: Works perfectly on mobile and desktop
- **⚡ Fast**: Instant access to your saved content

## 🚀 Quick Start

### 1. Supabase Setup

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Credentials**
   - Go to Settings → API
   - Copy your `Project URL` and `anon public` key

3. **Configure the App**
   - Open `script.js`
   - Replace `YOUR_SUPABASE_URL` with your Project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your anon public key

### 2. Database Setup

1. **Create the Content Table**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run this SQL:

```sql
-- Create the content table
CREATE TABLE snapsave_content (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL,
    password VARCHAR(2) NOT NULL,
    content TEXT NOT NULL,
    fileName VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_snapsave_password ON snapsave_content(password);
CREATE INDEX idx_snapsave_timestamp ON snapsave_content(timestamp);
```

2. **Create Storage Bucket**
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `snapsave-files`
   - Set the bucket to public (for file access)

3. **Set Storage Policies**
   - Go to Storage → Policies
   - Add these policies for the `snapsave-files` bucket:

```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'snapsave-files');

-- Allow authenticated uploads (we'll use anon key)
CREATE POLICY "Authenticated Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'snapsave-files');
```

### 3. Run the App

1. **Local Development**
   - Open `index.html` in your browser
   - Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Deploy to Web**
   - Upload files to any web hosting service
   - Popular options: Netlify, Vercel, GitHub Pages

## 📖 How to Use

### Adding Content

1. Click **"Add New"** in the navigation
2. Select content type (Photo, Video, URL, or Text)
3. Upload file or enter content
4. Enter a 2-digit password (00-99)
5. Click **"Save Content"**

### Accessing Content

1. Click **"Enter Code"** in the navigation
2. Enter your 2-digit password
3. Click **"Access Content"**
4. View your saved items in the **"View Saved"** section

## 🔧 Technical Details

### Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + Storage)
- **Authentication**: Custom 2-digit password system
- **UI**: Responsive design with CSS Grid/Flexbox

### File Structure
```
snapsave/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This file
```

### Database Schema
```sql
snapsave_content:
- id: Primary key
- type: Content type (photo, video, url, text)
- password: 2-digit access code
- content: File URL or text content
- fileName: Original filename (for files)
- timestamp: Creation timestamp
```

## 🔒 Security Considerations

⚠️ **Important**: The 2-digit password system provides minimal security (only 100 possible combinations). This app is designed for:

- **Quick sharing** between your own devices
- **Temporary storage** of non-sensitive content
- **Convenience** over security

### Security Limitations:
- Only 100 possible passwords (00-99)
- No encryption of stored content
- No rate limiting on password attempts
- No expiration of stored content

### Recommendations for Production:
- Use 4-6 digit passwords for better security
- Add rate limiting to prevent brute force
- Implement content expiration
- Add encryption for sensitive data
- Use HTTPS for all connections

## 🎨 Customization

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- The app uses CSS custom properties for easy theming
- Responsive design works on all screen sizes

### Features
- Add new content types in `script.js`
- Modify the password validation logic
- Add file size limits or type restrictions
- Implement content deletion functionality

## 🐛 Troubleshooting

### Common Issues

1. **"Please configure Supabase credentials"**
   - Make sure you've updated the URL and key in `script.js`

2. **"Failed to save content"**
   - Check your Supabase storage bucket is created
   - Verify storage policies are set correctly
   - Check browser console for detailed errors

3. **Files not uploading**
   - Ensure storage bucket is public
   - Check file size limits (Supabase has default limits)
   - Verify CORS settings if needed

4. **Content not loading**
   - Check database table exists
   - Verify password format (must be exactly 2 digits)
   - Check browser console for errors

### Debug Mode
Open browser developer tools (F12) to see detailed error messages and network requests.

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com) for backend services
- Icons from [Font Awesome](https://fontawesome.com)
- Modern CSS techniques and responsive design

---

**Happy saving! 🎉**
# Snapsave
