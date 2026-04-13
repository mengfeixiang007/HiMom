/**
 * Speech Module - Handles text-to-speech using browser's SpeechSynthesis API
 * Provides natural English voice output for toddlers
 */

/**
 * Speak text using browser's built-in text-to-speech
 * @param {string} text - The text to speak
 * @param {Object} options - Optional settings
 * @param {number} options.rate - Speech rate (0.1 to 10, default: 0.9)
 * @param {number} options.pitch - Speech pitch (0 to 2, default: 1.0)
 * @param {string} options.voiceName - Preferred voice name (optional)
 * @returns {Promise<void>} - Resolves when speech is finished
 */
export function speakText(text, options = {}) {
    return new Promise((resolve, reject) => {
        // Check if speech synthesis is supported
        if (!('speechSynthesis' in window)) {
            console.error('Speech synthesis not supported');
            reject(new Error('Speech synthesis not supported'));
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set options with defaults
        utterance.rate = options.rate || 0.9;  // Slightly slower for toddlers
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US'; // English

        // Try to find a female English voice
        const voices = window.speechSynthesis.getVoices();
        
        if (options.voiceName) {
            // Use specified voice if available
            const preferredVoice = voices.find(voice => voice.name === options.voiceName);
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
        } else {
            // Try to find a good English female voice
            const englishFemaleVoice = voices.find(voice => 
                voice.lang.startsWith('en') && 
                (voice.name.toLowerCase().includes('female') ||
                 voice.name.toLowerCase().includes('woman') ||
                 voice.name.toLowerCase().includes('samantha') ||
                 voice.name.toLowerCase().includes('google us english'))
            );
            
            if (englishFemaleVoice) {
                utterance.voice = englishFemaleVoice;
                console.log('Using voice:', englishFemaleVoice.name);
            }
        }

        // Event handlers
        utterance.onstart = () => {
            console.log('Speech started');
        };

        utterance.onend = () => {
            console.log('Speech finished');
            resolve();
        };

        utterance.onerror = (event) => {
            console.error('Speech error:', event);
            reject(event);
        };

        // Start speaking
        // Note: On mobile browsers, this must be triggered by user gesture
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 100);
    });
}

/**
 * Get available voices
 * @returns {Array<SpeechSynthesisVoice>} - List of available voices
 */
export function getAvailableVoices() {
    return window.speechSynthesis.getVoices();
}

// Preload voices (some browsers need this)
if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
}
