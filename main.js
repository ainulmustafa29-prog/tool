// Load auth.js script dynamically if not already loaded
function loadAuthScript() {
    if (!document.querySelector('script[src="auth.js"]')) {
        const script = document.createElement('script');
        script.src = 'auth.js';
        script.onload = function() {
            // Initialize auth after script loads
            if (typeof initAuth === 'function') {
                setTimeout(() => {
                    initAuth();
                }, 100);
            }
        };
        document.head.appendChild(script);
    } else if (typeof initAuth === 'function') {
        // Script already loaded, just initialize
        setTimeout(() => {
            initAuth();
        }, 100);
    }
}

// Dynamic Header and Footer Inclusion
document.addEventListener('DOMContentLoaded', function() {
    // Load auth.js first
    loadAuthScript();
    
    // Load Header
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            initializeDarkMode();
            initializeNavbar();
            // Initialize authentication after header loads
            setTimeout(() => {
                if (typeof initAuth === 'function') {
                    initAuth();
                } else {
                    // Retry if auth.js hasn't loaded yet
                    setTimeout(() => {
                        if (typeof initAuth === 'function') {
                            initAuth();
                        }
                    }, 500);
                }
            }, 200);
        })
        .catch(error => console.error('Error loading header:', error));

    // Load Footer
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
            initializeNewsletter();
        })
        .catch(error => console.error('Error loading footer:', error));
});

// Dark Mode Toggle
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<span id="darkModeIcon">☀️</span>';
        }
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = document.getElementById('darkModeIcon');
            if (icon) {
                icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            }
        });
    }
}

// Initialize Dark Mode on page load
function initializeDarkModeOnLoad() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const icon = document.getElementById('darkModeIcon');
        if (icon) {
            icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }
}

// Initialize on page load
initializeDarkModeOnLoad();

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('toolSearch');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterTools(this.value.toLowerCase());
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterTools(this.value.toLowerCase());
            }
        });
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchInput = document.getElementById('toolSearch');
            if (searchInput) {
                filterTools(searchInput.value.toLowerCase());
            }
        });
    }
}

function filterTools(searchTerm) {
    const toolCards = document.querySelectorAll('.tool-card');
    let visibleCount = 0;
    
    toolCards.forEach(card => {
        const toolName = card.querySelector('h5').textContent.toLowerCase();
        const toolDesc = card.querySelector('p').textContent.toLowerCase();
        const matches = toolName.includes(searchTerm) || toolDesc.includes(searchTerm);
        
        if (matches) {
            card.style.display = 'block';
            card.classList.add('fade-in');
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show message if no results
    const noResultsMsg = document.getElementById('noResults');
    if (visibleCount === 0 && searchTerm) {
        if (!noResultsMsg) {
            const msg = document.createElement('div');
            msg.id = 'noResults';
            msg.className = 'alert alert-info text-center mt-4';
            msg.innerHTML = '<h5>No tools found matching "' + searchTerm + '"</h5><p>Try a different search term.</p>';
            const container = document.querySelector('.tools-grid-container');
            if (container) {
                container.parentNode.insertBefore(msg, container.nextSibling);
            }
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Initialize Navbar
function initializeNavbar() {
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const navbar = document.querySelector('.navbar-collapse');
        const toggle = document.querySelector('.navbar-toggler');
        if (navbar && navbar.classList.contains('show') && !navbar.contains(event.target) && !toggle.contains(event.target)) {
            toggle.click();
        }
    });
}

// Newsletter Subscription
function initializeNewsletter() {
    const newsletterBtn = document.getElementById('newsletterBtn');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function() {
            const email = document.getElementById('newsletterEmail').value;
            if (email && validateEmail(email)) {
                alert('Thank you for subscribing! You will receive updates at ' + email);
                document.getElementById('newsletterEmail').value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// File Upload and Processing Functions
function initializeFileUpload(uploadAreaId, originalPreviewId, processedPreviewId, processFunction, allowedFileType) {
    const uploadArea = document.getElementById(uploadAreaId);
    const originalPreview = document.getElementById(originalPreviewId);
    const processedPreview = document.getElementById(processedPreviewId);
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    
    // Set file type restrictions
    if (allowedFileType === 'image') {
        fileInput.accept = 'image/*';
    } else if (allowedFileType === 'video') {
        // Accept various video formats
        fileInput.accept = 'video/*,.mp4,.webm,.ogg,.mov,.avi,.wmv,.flv,.mkv,.m4v,.3gp';
    }
    
    if (uploadArea) {
        uploadArea.appendChild(fileInput);
        
        // Ensure upload area is clickable
        uploadArea.style.cursor = 'pointer';
        
        // Click to upload - make entire upload area clickable
        uploadArea.addEventListener('click', (e) => {
            // Don't trigger if clicking on a button, link, or the file input itself
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && 
                !e.target.closest('button') && !e.target.closest('a') &&
                e.target !== fileInput && e.target.tagName !== 'INPUT') {
                
                // Stop immediate propagation to prevent backup handlers from firing
                e.stopImmediatePropagation();
                
                // Allow clicking anywhere in the upload area
                try {
                    // Directly trigger the file input click
                    fileInput.click();
                } catch (err) {
                    console.error('Error clicking file input:', err);
                    // Fallback: try with a small delay
                    setTimeout(() => {
                        try {
                            fileInput.click();
                        } catch (err2) {
                            console.error('Error in fallback click:', err2);
                        }
                    }, 10);
                }
            }
        }, true); // Use capture phase to fire before backup handlers
        
        // Drag and drop handlers
        let dragCounter = 0;
        
        uploadArea.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter++;
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter--;
            // Only remove dragover when we've actually left the upload area
            if (dragCounter === 0) {
                uploadArea.classList.remove('dragover');
            }
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter = 0;
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                
                // Validate file type before processing
                let isValid = false;
                if (allowedFileType === 'image') {
                    isValid = file.type.startsWith('image/') || 
                             /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);
                    if (!isValid) {
                        alert('Please drop an image file only. Video files are not allowed.');
                        return;
                    }
                } else if (allowedFileType === 'video') {
                    isValid = file.type.startsWith('video/') || 
                             /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp)$/i.test(file.name);
                    if (!isValid) {
                        alert('Please drop a video file only. Image files are not allowed.');
                        return;
                    }
                }
                
                if (isValid) {
                    handleFile(file, originalPreview, processedPreview, processFunction, allowedFileType);
                }
            }
        });
        
        // Prevent default drag behavior on document to avoid browser opening files
        // But allow it on the upload area
        document.addEventListener('dragover', (e) => {
            // Only prevent default if not over upload area
            if (!uploadArea.contains(e.target)) {
                e.preventDefault();
            }
        }, false);
        
        document.addEventListener('drop', (e) => {
            // Only prevent default if not over upload area
            if (!uploadArea.contains(e.target)) {
                e.preventDefault();
            }
        }, false);
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0], originalPreview, processedPreview, processFunction, allowedFileType);
            }
        });
    }
}

function handleFile(file, originalPreview, processedPreview, processFunction, allowedFileType) {
    // Validate file type (check both MIME type and file extension)
    if (allowedFileType === 'image') {
        const isImage = file.type.startsWith('image/') || 
                       /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);
        if (!isImage) {
            alert('Please upload an image file only. Video files are not allowed.');
            return;
        }
    } else if (allowedFileType === 'video') {
        const isVideo = file.type.startsWith('video/') || 
                       /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp)$/i.test(file.name);
        if (!isVideo) {
            alert('Please upload a video file only. Image files are not allowed.');
            return;
        }
    }
    
    // Show original file
    displayFile(file, originalPreview);
    
    // Process file
    if (processFunction) {
        processFunction(file, processedPreview);
    } else {
        // Default: just copy to processed preview
        displayFile(file, processedPreview);
    }
}

function displayFile(file, previewElement) {
    if (!previewElement) return;
    
    const reader = new FileReader();
    
    if (file.type.startsWith('image/')) {
        reader.onload = function(e) {
            previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp)$/i.test(file.name)) {
        // Use object URL for videos (more efficient for large files)
        const videoUrl = URL.createObjectURL(file);
        previewElement.innerHTML = `<video src="${videoUrl}" controls style="max-width: 100%; max-height: 100%;"></video>`;
        // Clean up the object URL when video is removed
        const video = previewElement.querySelector('video');
        if (video) {
            video.addEventListener('loadstart', function() {
                // Keep the URL while video is loading
            });
            video.addEventListener('error', function(e) {
                console.error('Video load error:', e);
                previewElement.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-video" style="font-size: 4rem; color: var(--accent-color); margin-bottom: 20px;"></i>
                        <p style="font-weight: 600; margin-bottom: 10px;">${file.name}</p>
                        <p style="color: var(--text-color); opacity: 0.7;">Video file loaded. Use the process button to remove background.</p>
                    </div>
                `;
            });
            // Note: URL will be revoked when new content is loaded or page unloads
        }
    } else if (file.type.startsWith('audio/')) {
        reader.onload = function(e) {
            previewElement.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-music" style="font-size: 4rem; color: var(--accent-color); margin-bottom: 20px;"></i>
                    <p style="font-weight: 600; margin-bottom: 10px;">${file.name}</p>
                    <audio src="${e.target.result}" controls style="width: 100%;"></audio>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        previewElement.innerHTML = `
            <div class="file-preview-placeholder">
                <i class="fas fa-file" style="font-size: 4rem; color: var(--accent-color); margin-bottom: 20px;"></i>
                <p style="font-weight: 600;">${file.name}</p>
                <p style="opacity: 0.7;">File type: ${file.type || 'Unknown'}</p>
            </div>
        `;
    }
}

// Download processed file
function downloadFile(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

