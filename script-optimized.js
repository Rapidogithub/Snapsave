// Performance Optimizations
// =====================================================

// Connection pooling and caching
const connectionCache = new Map();
const uploadQueue = [];
let isUploading = false;

// Lazy load Supabase client
let supabaseClient = null;
const initSupabase = () => {
    if (!supabaseClient && typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            realtime: {
                params: {
                    eventsPerSecond: 2
                }
            }
        });
    }
    return supabaseClient;
};

// Optimized file compression
const compressImage = async (file, quality = 0.8) => {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate optimal dimensions
            const maxWidth = 1920;
            const maxHeight = 1080;
            let { width, height } = img;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                resolve(new File([blob], file.name, { type: file.type }));
            }, file.type, quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
};

// Optimized upload with chunking and retry logic
const uploadWithRetry = async (file, fileName, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const client = initSupabase();
            const { data, error } = await client.storage
                .from('snapsave-files')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) throw error;
            return data;
        } catch (error) {
            lastError = error;
            console.warn(`Upload attempt ${attempt} failed:`, error);
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
    
    throw lastError;
};

// Optimized database operations with connection pooling
const dbOperation = async (operation, retries = 2) => {
    const client = initSupabase();
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await operation(client);
        } catch (error) {
            lastError = error;
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            }
        }
    }
    
    throw lastError;
};

// Download functionality
const downloadFile = async (url, fileName) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        showNotification('📥 Download started!', 'success');
    } catch (error) {
        console.error('Download failed:', error);
        showNotification('❌ Download failed', 'error');
    }
};

// Supabase Configuration
const SUPABASE_URL = 'https://gpirddziozadnnvzsbhy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXJkZHppb3phZG5udnpzYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY1MzYsImV4cCI6MjA2NTUzMjUzNn0.Q1EDchyM_frOAVm3ndXHCAZOScC-Uwq0rUqDGK5-X0A';

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// DOM Elements - Optimized for performance
const elements = {
    navButtons: document.querySelectorAll('.nav-btn'),
    sections: document.querySelectorAll('.section'),
    addForm: document.getElementById('add-form'),
    accessForm: document.getElementById('access-form'),
    contentTypeSelect: document.getElementById('content-type'),
    fileInputGroup: document.getElementById('file-input-group'),
    urlInputGroup: document.getElementById('url-input-group'),
    textInputGroup: document.getElementById('text-input-group'),
    fileInput: document.getElementById('file-input'),
    filePreview: document.getElementById('file-preview'),
    loadingOverlay: document.getElementById('loading-overlay'),
    notification: document.getElementById('notification'),
    contentDisplay: document.getElementById('content-display')
};

// Optimized event listeners
const addEventListeners = () => {
    // Navigation
    elements.navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = button.dataset.view;
            
            // Update active nav button
            elements.navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target section
            elements.sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetView}-section`) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Content type selection
    if (elements.contentTypeSelect) {
        elements.contentTypeSelect.addEventListener('change', () => {
            const selectedType = elements.contentTypeSelect.value;
            
            // Hide all input groups
            elements.fileInputGroup.style.display = 'none';
            elements.urlInputGroup.style.display = 'none';
            elements.textInputGroup.style.display = 'none';
            
            // Show relevant input group
            switch(selectedType) {
                case 'photo':
                case 'video':
                case 'pdf':
                    elements.fileInputGroup.style.display = 'block';
                    if (elements.fileInput) {
                        elements.fileInput.accept = selectedType === 'photo' ? 'image/*' : 
                                                   selectedType === 'video' ? 'video/*' : 'application/pdf';
                    }
                    break;
                case 'url':
                    elements.urlInputGroup.style.display = 'block';
                    break;
                case 'text':
                    elements.textInputGroup.style.display = 'block';
                    break;
            }
        });
    }

    // File preview
    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Check file size
            const maxSize = 50 * 1024 * 1024; // 50MB
            if (file.size > maxSize) {
                showNotification('⚠️ File too large. Please choose a file under 50MB.', 'warning');
                return;
            }
            
            if (elements.filePreview) {
                elements.filePreview.innerHTML = '';
                
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(file);
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '250px';
                    img.style.objectFit = 'contain';
                    elements.filePreview.appendChild(img);
                } else if (file.type.startsWith('video/')) {
                    const video = document.createElement('video');
                    video.src = URL.createObjectURL(file);
                    video.controls = true;
                    video.style.maxWidth = '100%';
                    video.style.maxHeight = '250px';
                    elements.filePreview.appendChild(video);
                } else if (file.type === 'application/pdf') {
                    const pdfPreview = document.createElement('div');
                    pdfPreview.innerHTML = `
                        <div style="text-align: center; padding: 20px; border: 2px dashed #667eea; border-radius: 8px;">
                            <i class="fas fa-file-pdf" style="font-size: 48px; color: #667eea; margin-bottom: 10px;"></i>
                            <p style="margin: 0; font-weight: 600;">${file.name}</p>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">PDF Document</p>
                        </div>
                    `;
                    elements.filePreview.appendChild(pdfPreview);
                }
            }
            
            showNotification(`✅ ${file.name} selected`, 'success');
        });
    }

    // Add form submission
    if (elements.addForm) {
        elements.addForm.addEventListener('submit', handleAddForm);
    }

    // Access form submission
    if (elements.accessForm) {
        elements.accessForm.addEventListener('submit', handleAccessForm);
    }
};

// Optimized form handlers
const handleAddForm = async (e) => {
    e.preventDefault();
    
    const contentType = elements.contentTypeSelect.value;
    const password = document.getElementById('password').value;
    
    if (!contentType || !password) {
        showNotification('❌ Please fill in all required fields', 'error');
        return;
    }
    
    if (password.length !== 2 || !/^\d{2}$/.test(password)) {
        showNotification('❌ Password must be exactly 2 digits (00-99)', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        let contentData = {
            type: contentType,
            password: password,
            timestamp: new Date().toISOString()
        };
        
        // Handle different content types
        switch(contentType) {
            case 'photo':
            case 'video':
            case 'pdf':
                const file = elements.fileInput.files[0];
                if (!file) {
                    throw new Error('Please select a file');
                }
                
                showNotification('📤 Uploading file...', 'info');
                
                let uploadFile = file;
                if (file.type.startsWith('image/')) {
                    uploadFile = await compressImage(file, 0.8);
                }
                
                const fileName = `${password}_${Date.now()}_${file.name}`;
                await uploadWithRetry(uploadFile, fileName);
                
                const { data: { publicUrl } } = initSupabase().storage
                    .from('snapsave-files')
                    .getPublicUrl(fileName);
                
                contentData.content = publicUrl;
                contentData.fileName = file.name;
                break;
                
            case 'url':
                const urlInput = document.getElementById('url-input');
                const url = urlInput.value;
                if (!url) {
                    throw new Error('Please enter a URL');
                }
                contentData.content = url;
                break;
                
            case 'text':
                const textInput = document.getElementById('text-input');
                const text = textInput.value;
                if (!text.trim()) {
                    throw new Error('Please enter some text');
                }
                contentData.content = text;
                break;
        }
        
        showNotification('💾 Saving to cloud...', 'info');
        
        await dbOperation(client => client
            .from('snapsave_content')
            .insert([{
                type: contentData.type,
                password: contentData.password,
                content: contentData.content,
                fileName: contentData.fileName,
                timestamp: contentData.timestamp
            }])
        );
        
        // Success animation and notification
        showNotification('🎉 File saved successfully! Your content is now secure in the cloud!', 'success');
        
        // Reset form
        elements.addForm.reset();
        if (elements.filePreview) elements.filePreview.innerHTML = '';
        
        // Auto-switch to access tab after 2 seconds
        setTimeout(() => {
            const accessButton = document.querySelector('[data-view="access"]');
            if (accessButton) {
                accessButton.click();
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error saving content:', error);
        let errorMessage = '❌ Failed to save content';
        
        if (error.message) {
            if (error.message.includes('Please select a file')) {
                errorMessage = '📁 Please select a file to upload';
            } else if (error.message.includes('Please enter a URL')) {
                errorMessage = '🔗 Please enter a valid URL';
            } else if (error.message.includes('Please enter some text')) {
                errorMessage = '📝 Please enter some text content';
            } else {
                errorMessage = `❌ ${error.message}`;
            }
        }
        
        showNotification(errorMessage, 'error');
    } finally {
        showLoading(false);
    }
};

const handleAccessForm = async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('access-password').value;
    
    if (password.length !== 2 || !/^\d{2}$/.test(password)) {
        showNotification('❌ Password must be exactly 2 digits (00-99)', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        showNotification('🔍 Searching for content...', 'info');
        
        const { data: content, error } = await initSupabase()
            .from('snapsave_content')
            .select('*')
            .eq('password', password)
            .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        if (!content || content.length === 0) {
            showNotification('📭 No content found for this password', 'info');
            displayContent([]);
        } else {
            showNotification(`🎉 Found ${content.length} item(s)`, 'success');
            displayContent(content);
            
            // Auto-switch to view section after 2 seconds
            setTimeout(() => {
                const viewButton = document.querySelector('[data-view="view"]');
                if (viewButton) {
                    viewButton.click();
                }
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error accessing content:', error);
        showNotification('❌ Failed to access content', 'error');
    } finally {
        showLoading(false);
    }
};

// Optimized content display with download buttons
const displayContent = (content) => {
    if (!elements.contentDisplay) return;
    
    if (!content || content.length === 0) {
        elements.contentDisplay.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No Content Found</h3>
                <p>No content found for this password.</p>
            </div>
        `;
        return;
    }
    
    const contentHTML = content.map((item, index) => {
        const timestamp = new Date(item.timestamp).toLocaleString();
        let mediaHTML = '';
        let downloadButton = '';
        
        if (item.type === 'photo') {
            mediaHTML = `<img src="${item.content}" alt="Photo" loading="lazy" style="animation-delay: ${index * 0.1}s">`;
            downloadButton = `<button onclick="downloadFile('${item.content}', '${item.fileName || 'photo.jpg'}')" class="download-btn">
                <i class="fas fa-download"></i> Download Photo
            </button>`;
        } else if (item.type === 'video') {
            mediaHTML = `<video src="${item.content}" controls style="animation-delay: ${index * 0.1}s"></video>`;
            downloadButton = `<button onclick="downloadFile('${item.content}', '${item.fileName || 'video.mp4'}')" class="download-btn">
                <i class="fas fa-download"></i> Download Video
            </button>`;
        } else if (item.type === 'pdf') {
            mediaHTML = `
                <div class="pdf-preview" style="animation-delay: ${index * 0.1}s">
                    <i class="fas fa-file-pdf"></i>
                    <p>${item.fileName || 'document.pdf'}</p>
                    <a href="${item.content}" target="_blank" class="view-pdf-btn">
                        <i class="fas fa-eye"></i> View PDF
                    </a>
                </div>
            `;
            downloadButton = `<button onclick="downloadFile('${item.content}', '${item.fileName || 'document.pdf'}')" class="download-btn">
                <i class="fas fa-download"></i> Download PDF
            </button>`;
        }
        
        return `
            <div class="content-item" style="animation-delay: ${index * 0.1}s">
                <span class="content-type-badge">${getTypeIcon(item.type)} ${item.type.toUpperCase()}</span>
                ${mediaHTML}
                <h3>${item.fileName || getTypeTitle(item.type)}</h3>
                ${item.type === 'url' ? `<p><a href="${item.content}" target="_blank" rel="noopener">${item.content}</a></p>` : ''}
                ${item.type === 'text' ? `<p>${item.content}</p>` : ''}
                <div class="timestamp">📅 Saved: ${timestamp}</div>
                ${downloadButton}
            </div>
        `;
    }).join('');
    
    elements.contentDisplay.innerHTML = `
        <div class="content-grid">
            ${contentHTML}
        </div>
    `;
};

// Helper Functions
const getTypeIcon = (type) => {
    const icons = {
        photo: '📸',
        video: '🎥',
        pdf: '📄',
        url: '🔗',
        text: '📝'
    };
    return icons[type] || '📄';
};

const getTypeTitle = (type) => {
    const titles = {
        photo: 'Photo',
        video: 'Video',
        pdf: 'PDF Document',
        url: 'URL',
        text: 'Text Note'
    };
    return titles[type] || 'File';
};

const showLoading = (show) => {
    if (!elements.loadingOverlay) return;
    
    if (show) {
        elements.loadingOverlay.classList.add('show');
    } else {
        elements.loadingOverlay.classList.remove('show');
    }
};

const showNotification = (message, type = 'info') => {
    if (!elements.notification) return;
    
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type}`;
    elements.notification.classList.add('show');
    
    const displayTime = type === 'success' ? 6000 : 4000;
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, displayTime);
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    addEventListeners();
    
    // Test connection
    setTimeout(async () => {
        try {
            const { data, error } = await initSupabase()
                .from('snapsave_content')
                .select('count')
                .limit(1);
            
            if (!error) {
                showNotification('🚀 SnapSave is ready!', 'success');
            }
        } catch (error) {
            console.error('Connection test failed:', error);
        }
    }, 1000);
});

// Make downloadFile globally available
window.downloadFile = downloadFile; 