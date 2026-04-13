/**
 * Main Application Script
 * Handles user interactions and orchestrates all modules
 */

import camera from './modules/camera.js';
import { describeImage } from './modules/vision.js';
import { speakText } from './modules/speech.js';

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');
const subtitleContainer = document.getElementById('subtitle-container');
const subtitleText = document.getElementById('subtitle-text');
const statusIcon = document.getElementById('status-icon');
const videoElement = document.getElementById('camera-feed');

/**
 * Show loading indicator
 */
function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

/**
 * Show subtitle text
 * @param {string} text - Text to display
 * @param {number} duration - How long to show in milliseconds (default: 3000)
 */
function showSubtitle(text, duration = 3000) {
    if (!subtitleText || !subtitleContainer) return;
    
    subtitleText.textContent = text;
    subtitleContainer.classList.remove('hidden');
    
    // Auto-hide after duration
    setTimeout(() => {
        subtitleContainer.classList.add('hidden');
    }, duration);
}

/**
 * Animate status icon (ear emoji rotation)
 */
function animateStatusIcon() {
    if (!statusIcon) return;
    
    // Remove class to reset animation
    statusIcon.classList.remove('active');
    
    // Force reflow to restart animation
    void statusIcon.offsetWidth;
    
    // Add animation class
    statusIcon.classList.add('active');
    
    // Remove class after animation completes
    setTimeout(() => {
        statusIcon.classList.remove('active');
    }, 600);
}

/**
 * Handle double-tap/double-click on video
 * This is the main interaction flow:
 * 1. Capture frame
 * 2. Send to AI for description
 * 3. Speak the description
 * 4. Show subtitle
 */
async function handleDoubleTap(event) {
    console.log('Double tap detected!');
    
    try {
        // Step 1: Show loading state
        showLoading();
        animateStatusIcon();
        
        // Step 2: Capture current frame from camera
        const base64Image = camera.captureFrame(800, 0.7);
        
        if (!base64Image) {
            throw new Error('Failed to capture image');
        }
        
        console.log('Image captured, size:', base64Image.length);
        
        // Step 3: Send to AI for description
        const description = await describeImage(base64Image);
        
        if (!description) {
            throw new Error('No description received');
        }
        
        console.log('Description received:', description);
        
        // Step 4: Hide loading
        hideLoading();
        
        // Step 5: Speak the description (requires user gesture, which we have)
        await speakText(description);
        
        // Step 6: Show subtitle for 3 seconds
        showSubtitle(description, 3000);
        
    } catch (error) {
        console.error('Error in double-tap handler:', error);
        hideLoading();
        alert('Oops! Something went wrong: ' + error.message);
    }
}

/**
 * Initialize the application
 */
async function initApp() {
    console.log('Initializing Hi\'Mom app...');
    
    // Check if we're on iOS and show warning if needed
    checkIOSCompatibility();
    
    // Check if Service Worker is registered
    registerServiceWorker();
    
    // Start the camera
    const cameraStarted = await camera.start();
    
    if (cameraStarted) {
        console.log('Camera ready, waiting for user interaction...');
        
        // Add double-click/tap event listener to video element
        // Using dblclick for desktop and custom double-tap for mobile
        setupDoubleTapHandler();
    } else {
        console.error('Failed to start camera');
    }
}

/**
 * Setup double tap handler for both desktop and mobile
 */
function setupDoubleTapHandler() {
    let lastTap = 0;
    const doubleTapDelay = 300; // milliseconds
    
    // Handler for touch events (mobile)
    function handleTouchEnd(event) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < doubleTapDelay && tapLength > 0) {
            // Double tap detected!
            event.preventDefault();
            handleDoubleTap(event);
        }
        
        lastTap = currentTime;
    }
    
    // Handler for click events (desktop)
    function handleClick(event) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < doubleTapDelay && tapLength > 0) {
            // Double click detected!
            event.preventDefault();
            handleDoubleTap(event);
        }
        
        lastTap = currentTime;
    }
    
    // Add event listeners
    videoElement.addEventListener('touchend', handleTouchEnd);
    videoElement.addEventListener('click', handleClick);
    
    console.log('Double tap handler registered');
}

/**
 * Check iOS compatibility and show warning if needed
 */
function checkIOSCompatibility() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone;
    
    if (isIOS && !isStandalone) {
        // Show iOS warning for non-standalone mode
        const iosWarning = document.getElementById('ios-warning');
        if (iosWarning) {
            iosWarning.classList.remove('hidden');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                iosWarning.classList.add('hidden');
            }, 5000);
        }
    }
}

/**
 * Register Service Worker for PWA functionality
 */
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
                console.log('New version available!');
            });
            
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    } else {
        console.warn('Service Workers not supported');
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
