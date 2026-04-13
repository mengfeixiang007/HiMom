/**
 * Vision Module - Handles AI image recognition using Qwen VL
 * Communicates with the EdgeOne Pages cloud function
 */

/**
 * Send image to backend for AI description
 * @param {string} base64Image - Base64 encoded image data URL (with data:image/jpeg;base64, prefix)
 * @returns {Promise<string>} - AI generated English description
 */
export async function describeImage(base64Image) {
    try {
        console.log('Sending image to AI service...');
        
        // Make POST request to the cloud function
        const response = await fetch('/api/describe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: base64Image
            })
        });

        // Check if request was successful
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // Parse the response
        const data = await response.json();
        
        if (!data.description) {
            throw new Error('No description received from server');
        }

        console.log('Received description:', data.description);
        return data.description;

    } catch (error) {
        console.error('Failed to get image description:', error);
        throw new Error(`Vision API error: ${error.message}`);
    }
}
