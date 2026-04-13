/**
 * Camera Module - Handles camera access and frame capture
 * Provides methods to start camera and capture frames as Base64
 */

class Camera {
    constructor() {
        this.videoElement = document.getElementById('camera-feed');
        this.stream = null;
        this.isRunning = false;
    }

    /**
     * Start the camera stream (prefer rear camera on mobile)
     * @returns {Promise<boolean>} - true if successful, false otherwise
     */
    async start() {
        try {
            // Request camera permissions with preference for rear camera
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Prefer rear camera on mobile devices
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false // No audio needed for this app
            });

            // Set the video source to the camera stream
            this.videoElement.srcObject = this.stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.isRunning = true;
                    resolve();
                };
            });

            console.log('Camera started successfully');
            return true;

        } catch (error) {
            console.error('Failed to start camera:', error);
            
            // Show permission denied message if user rejected
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                this.showPermissionDenied();
            } else {
                alert('Camera error: ' + error.message);
            }
            
            return false;
        }
    }

    /**
     * Stop the camera stream
     */
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.isRunning = false;
            console.log('Camera stopped');
        }
    }

    /**
     * Capture current video frame and convert to compressed JPEG Base64
     * @param {number} maxWidth - Maximum width of the captured image (default: 800)
     * @param {number} quality - JPEG quality 0-1 (default: 0.7)
     * @returns {string|null} - Base64 data URL or null if failed
     */
    captureFrame(maxWidth = 800, quality = 0.7) {
        if (!this.isRunning) {
            console.error('Camera is not running');
            return null;
        }

        try {
            // Create a canvas element to capture the frame
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate dimensions while maintaining aspect ratio
            const videoWidth = this.videoElement.videoWidth;
            const videoHeight = this.videoElement.videoHeight;
            const scale = Math.min(maxWidth / videoWidth, 1);
            
            canvas.width = videoWidth * scale;
            canvas.height = videoHeight * scale;

            // Draw the current video frame to canvas
            ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

            // Convert to JPEG Base64 data URL
            const dataURL = canvas.toDataURL('image/jpeg', quality);
            
            console.log('Frame captured:', dataURL.length, 'bytes');
            return dataURL;

        } catch (error) {
            console.error('Failed to capture frame:', error);
            return null;
        }
    }

    /**
     * Show permission denied UI
     */
    showPermissionDenied() {
        const permissionDeniedEl = document.getElementById('permission-denied');
        if (permissionDeniedEl) {
            permissionDeniedEl.classList.remove('hidden');
        }
        
        // Hide the video element
        if (this.videoElement) {
            this.videoElement.style.display = 'none';
        }
    }
}

// Export singleton instance
const camera = new Camera();
export default camera;
