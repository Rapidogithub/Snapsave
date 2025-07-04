// Supabase Configuration
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://gpirddziozadnnvzsbhy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybWd2ZWxqeHdhYmZ4dmVpb3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTAzMDMsImV4cCI6MjA2NTIyNjMwM30.PBwnO-dKjsSJSCGULci6ncpiWdcxtmVUT7Psm_GhORI';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements - with null checks
const navButtons = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const addForm = document.getElementById('add-form');
const accessForm = document.getElementById('access-form');
const contentTypeSelect = document.getElementById('content-type');
const fileInputGroup = document.getElementById('file-input-group');
const urlInputGroup = document.getElementById('url-input-group');
const textInputGroup = document.getElementById('text-input-group');
const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');
const loadingOverlay = document.getElementById('loading-overlay');
const notification = document.getElementById('notification');
const contentDisplay = document.getElementById('content-display');

// Mobile Menu Functionality
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu = document.getElementById('close-menu');
const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

// Upload card functionality
const uploadCards = document.querySelectorAll('.upload-card');
const uploadForm = document.getElementById('upload-form');
const backBtn = document.getElementById('back-btn');
const formTitle = document.getElementById('form-title');

// Helper function to safely add event listeners
function safeAddEventListener(element, event, handler) {
    if (element) {
        element.addEventListener(event, handler);
    }
}

// Mobile menu toggle
safeAddEventListener(mobileMenuBtn, 'click', () => {
    if (mobileMenu) mobileMenu.classList.add('show');
});

safeAddEventListener(closeMenu, 'click', () => {
    if (mobileMenu) mobileMenu.classList.remove('show');
});

// Close mobile menu when clicking outside
safeAddEventListener(mobileMenu, 'click', (e) => {
    if (e.target === mobileMenu) {
        mobileMenu.classList.remove('show');
    }
});

// Mobile nav items
mobileNavItems.forEach(item => {
    item.addEventListener('click', () => {
        if (mobileMenu) mobileMenu.classList.remove('show');
        const targetView = item.dataset.view;
        
        // Update navigation
        navButtons.forEach(btn => btn.classList.remove('active'));
        const targetNav = document.querySelector(`[data-view="${targetView}"]`);
        if (targetNav) targetNav.classList.add('active');
        
        // Show target section
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${targetView}-section`) {
                section.classList.add('active');
            }
        });
    });
});

// Upload card functionality
uploadCards.forEach(card => {
    card.addEventListener('click', () => {
        const type = card.dataset.type;
        if (contentTypeSelect) contentTypeSelect.value = type;
        
        // Show upload form
        const uploadCardsContainer = document.querySelector('.upload-cards');
        if (uploadCardsContainer) uploadCardsContainer.style.display = 'none';
        if (uploadForm) uploadForm.style.display = 'block';
        
        // Update form title
        if (formTitle) formTitle.textContent = `Upload ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        // Trigger content type change
        if (contentTypeSelect) contentTypeSelect.dispatchEvent(new Event('change'));
    });
});

safeAddEventListener(backBtn, 'click', () => {
    if (uploadForm) uploadForm.style.display = 'none';
    const uploadCardsContainer = document.querySelector('.upload-cards');
    if (uploadCardsContainer) uploadCardsContainer.style.display = 'grid';
    
    // Reset form
    if (addForm) addForm.reset();
    if (filePreview) {
        filePreview.innerHTML = `
            <div class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to select file</p>
            </div>
        `;
    }
});

// Navigation
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetView = button.dataset.view;
        
        // Update active nav button
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show target section
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${targetView}-section`) {
                section.classList.add('active');
            }
        });
    });
});

// Content Type Selection
safeAddEventListener(contentTypeSelect, 'change', () => {
    const selectedType = contentTypeSelect.value;
    console.log('Content type selected:', selectedType);
    
    // Hide all input groups
    if (fileInputGroup) fileInputGroup.style.display = 'none';
    if (urlInputGroup) urlInputGroup.style.display = 'none';
    if (textInputGroup) textInputGroup.style.display = 'none';
    
    // Show relevant input group
    switch(selectedType) {
        case 'photo':
        case 'video':
            console.log('Showing file input group');
            if (fileInputGroup) fileInputGroup.style.display = 'block';
            if (fileInput) fileInput.accept = selectedType === 'photo' ? 'image/*' : 'video/*';
            showNotification(`Ready to upload ${selectedType}! Click "Choose File" below.`, 'info');
            break;
        case 'url':
            console.log('Showing URL input group');
            if (urlInputGroup) urlInputGroup.style.display = 'block';
            showNotification('Enter the URL you want to save', 'info');
            break;
        case 'text':
            console.log('Showing text input group');
            if (textInputGroup) textInputGroup.style.display = 'block';
            showNotification('Enter your text note below', 'info');
            break;
    }
});

// File Preview
safeAddEventListener(fileInput, 'change', (e) => {
    const file = e.target.files[0];
    if (!file) {
        if (filePreview) filePreview.innerHTML = '<p>No file selected</p>';
        return;
    }
    
    if (filePreview) filePreview.innerHTML = '';
    
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        if (filePreview) filePreview.appendChild(img);
    } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        if (filePreview) filePreview.appendChild(video);
    }
});

// Add New Content Form
safeAddEventListener(addForm, 'submit', async (e) => {
    e.preventDefault();
    
    const contentType = contentTypeSelect ? contentTypeSelect.value : '';
    const password = document.getElementById('password') ? document.getElementById('password').value : '';
    
    if (!contentType || !password) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (password.length !== 2 || !/^\d{2}$/.test(password)) {
        showNotification('Password must be exactly 2 digits (00-99)', 'error');
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
                const file = fileInput ? fileInput.files[0] : null;
                if (!file) {
                    throw new Error('Please select a file');
                }
                
                // Upload file to Supabase Storage
                const fileName = `${password}_${Date.now()}_${file.name}`;
                const { data: uploadData, error: uploadError } = await supabaseClient.storage
                    .from('snapsave-files')
                    .upload(fileName, file);
                
                if (uploadError) throw uploadError;
                
                // Get public URL
                const { data: { publicUrl } } = supabaseClient.storage
                    .from('snapsave-files')
                    .getPublicUrl(fileName);
                
                contentData.content = publicUrl;
                contentData.fileName = file.name;
                break;
                
            case 'url':
                const urlInput = document.getElementById('url-input');
                const url = urlInput ? urlInput.value : '';
                if (!url) {
                    throw new Error('Please enter a URL');
                }
                contentData.content = url;
                contentData.fileName = null;
                break;
                
            case 'text':
                const textInput = document.getElementById('text-input');
                const text = textInput ? textInput.value : '';
                if (!text.trim()) {
                    throw new Error('Please enter some text');
                }
                contentData.content = text;
                contentData.fileName = null;
                break;
        }
        
        // Save to database
        const { error: dbError } = await supabaseClient
            .from('snapsave_content')
            .insert([{
                type: contentData.type,
                password: contentData.password,
                content: contentData.content,
                fileName: contentData.fileName || null,
                timestamp: contentData.timestamp
            }]);
        
        if (dbError) throw dbError;
        
        showNotification('Content saved successfully!', 'success');
        if (addForm) addForm.reset();
        if (filePreview) filePreview.innerHTML = '';
        
    } catch (error) {
        console.error('Error saving content:', error);
        
        // Provide specific error messages
        let errorMessage = 'Failed to save content';
        
        if (error.message) {
            if (error.message.includes('Unauthorized') || error.message.includes('403')) {
                errorMessage = 'Database not properly configured. Please run the quick-fix.sql in your Supabase dashboard.';
            } else if (error.message.includes('Please select a file')) {
                errorMessage = 'Please select a file to upload';
            } else if (error.message.includes('Please enter a URL')) {
                errorMessage = 'Please enter a valid URL';
            } else if (error.message.includes('Please enter some text')) {
                errorMessage = 'Please enter some text content';
            } else {
                errorMessage = error.message;
            }
        } else if (error.error) {
            if (error.error === 'Unauthorized') {
                errorMessage = 'Database not properly configured. Please run the quick-fix.sql in your Supabase dashboard.';
            } else {
                errorMessage = error.error;
            }
        }
        
        showNotification(errorMessage, 'error');
    } finally {
        showLoading(false);
    }
});

// Access Content Form
safeAddEventListener(accessForm, 'submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('access-password') ? document.getElementById('access-password').value : '';
    
    if (password.length !== 2 || !/^\d{2}$/.test(password)) {
        showNotification('Password must be exactly 2 digits (00-99)', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // Fetch content from database
        const { data: content, error } = await supabaseClient
            .from('snapsave_content')
            .select('*')
            .eq('password', password)
            .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        if (!content || content.length === 0) {
            showNotification('No content found for this password', 'info');
            displayContent([]);
        } else {
            showNotification(`Found ${content.length} item(s)`, 'success');
            displayContent(content);
            
            // Switch to view section
            const viewButton = document.querySelector('[data-view="view"]');
            if (viewButton) viewButton.click();
        }
        
    } catch (error) {
        console.error('Error accessing content:', error);
        showNotification('Failed to access content', 'error');
    } finally {
        showLoading(false);
    }
});

// Display Content
function displayContent(content) {
    if (!contentDisplay) return;
    
    if (!content || content.length === 0) {
        contentDisplay.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3>No Content Found</h3>
                <p>No content found for this password.</p>
            </div>
        `;
        return;
    }
    
    const contentHTML = content.map(item => {
        const timestamp = new Date(item.timestamp).toLocaleString();
        let mediaHTML = '';
        
        if (item.type === 'photo') {
            mediaHTML = `<img src="${item.content}" alt="Photo" loading="lazy">`;
        } else if (item.type === 'video') {
            mediaHTML = `<video src="${item.content}" controls></video>`;
        }
        
        return `
            <div class="content-item">
                <span class="content-type-badge ${item.type}">
                    ${getTypeIcon(item.type)} ${item.type.toUpperCase()}
                </span>
                ${mediaHTML}
                <h3>${item.fileName || getTypeTitle(item.type)}</h3>
                ${item.type === 'url' ? `<p><a href="${item.content}" target="_blank">${item.content}</a></p>` : ''}
                ${item.type === 'text' ? `<p>${item.content}</p>` : ''}
                <div class="timestamp">Saved: ${timestamp}</div>
            </div>
        `;
    }).join('');
    
    contentDisplay.innerHTML = `
        <div class="content-grid">
            ${contentHTML}
        </div>
    `;
}

// Helper Functions
function getTypeIcon(type) {
    const icons = {
        photo: '📸',
        video: '🎥',
        url: '🔗',
        text: '📝'
    };
    return icons[type] || '📄';
}

function getTypeTitle(type) {
    const titles = {
        photo: 'Photo',
        video: 'Video',
        url: 'URL',
        text: 'Text Note'
    };
    return titles[type] || 'File';
}

function showLoading(show) {
    if (!loadingOverlay) return;
    
    if (show) {
        loadingOverlay.classList.add('show');
    } else {
        loadingOverlay.classList.remove('show');
    }
}

function showNotification(message, type = 'info') {
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Input validation for 2-digit passwords
document.querySelectorAll('input[pattern="[0-9]{2}"]').forEach(input => {
    input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
    });
});

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Check if Supabase is configured
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        showNotification('Please configure Supabase credentials in script.js', 'error');
        return;
    }
    
    // Test Supabase connection
    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabaseClient
            .from('snapsave_content')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('Database error:', error);
            showNotification('Database not set up. Please create the table first.', 'error');
        } else {
            console.log('Supabase connection successful!');
            showNotification('SnapSave is ready to use!', 'success');
        }
    } catch (error) {
        console.error('Connection test failed:', error);
        showNotification('Failed to connect to database. Check your setup.', 'error');
    }
});
