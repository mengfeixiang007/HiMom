/**
 * EdgeOne Pages Cloud Function - AI Image Description
 * Receives image as Base64, calls Qwen VL API, returns English description
 */

const https = require('https');

/**
 * Main request handler for EdgeOne Pages function
 * @param {Object} event - Request event object
 * @returns {Object} - Response object
 */
exports.onRequest = async (event) => {
    try {
        // Only accept POST requests
        if (event.request.method !== 'POST') {
            return {
                statusCode: 405,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({
                    error: 'Method not allowed. Use POST.'
                })
            };
        }

        // Parse request body
        let requestBody = '';
        
        // Handle different ways the body might be provided
        if (event.body) {
            requestBody = typeof event.body === 'string' ? event.body : JSON.stringify(event.body);
        } else if (event.request.body) {
            // If body is a stream, collect it
            if (typeof event.request.body.on === 'function') {
                requestBody = await new Promise((resolve, reject) => {
                    let data = '';
                    event.request.body.on('data', chunk => {
                        data += chunk;
                    });
                    event.request.body.on('end', () => resolve(data));
                    event.request.body.on('error', reject);
                });
            } else {
                requestBody = event.request.body;
            }
        }

        const parsedBody = JSON.parse(requestBody);
        const base64Image = parsedBody.image;

        // Validate input
        if (!base64Image) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Missing image in request body. Send { "image": "data:image/jpeg;base64,..." }'
                })
            };
        }

        // Get API key from environment variable
        const apiKey = process.env.DASHSCOPE_API_KEY;
        
        if (!apiKey) {
            console.error('DASHSCOPE_API_KEY not configured');
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Server configuration error: API key not set'
                })
            };
        }

        // Extract pure base64 data (remove data:image/jpeg;base64, prefix if present)
        const pureBase64 = base64Image.replace(/^data:image\/jpeg;base64,/, '');

        // Call Qwen VL API
        const description = await callQwenVL(pureBase64, apiKey);

        // Return successful response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                description: description
            })
        };

    } catch (error) {
        console.error('Error in describe function:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: error.message || 'Internal server error'
            })
        };
    }
};

/**
 * Call Qwen VL Plus API for image description
 * @param {string} base64Image - Pure base64 image data (without prefix)
 * @param {string} apiKey - DashScope API key
 * @returns {Promise<string>} - Generated description
 */
function callQwenVL(base64Image, apiKey) {
    return new Promise((resolve, reject) => {
        // Prepare the request payload for Qwen VL API
        const requestBody = {
            model: 'qwen-vl-plus',
            input: {
                messages: [
                    {
                        role: 'system',
                        content: 'You are a gentle mother describing things to a toddler. Describe the main object in this image using simple, sensory English. Use 10-20 words. Mention color, shape, texture, or what it might feel like. Sound warm and slightly playful. Return only the English sentence, no extra text.'
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                image: `data:image/jpeg;base64,${base64Image}`
                            }
                        ]
                    }
                ]
            },
            parameters: {
                max_tokens: 100,
                temperature: 0.7
            }
        };

        // Prepare HTTP request options
        const options = {
            hostname: 'dashscope.aliyuncs.com',
            port: 443,
            path: '/api/v1/services/aigc/multimodal-generation/generation',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'HiMom-App/1.0'
            }
        };

        // Make the HTTPS request
        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    // Parse the response
                    const parsedResponse = JSON.parse(responseData);

                    // Check for errors in the response
                    if (parsedResponse.code || parsedResponse.error_code) {
                        const errorMsg = parsedResponse.message || parsedResponse.error_message || 'Unknown API error';
                        reject(new Error(`Qwen API Error: ${errorMsg}`));
                        return;
                    }

                    // Extract the description from the response
                    // The exact path depends on Qwen API response structure
                    let description = '';
                    
                    if (parsedResponse.output && 
                        parsedResponse.output.choices && 
                        parsedResponse.output.choices[0] && 
                        parsedResponse.output.choices[0].message &&
                        parsedResponse.output.choices[0].message.content) {
                        
                        const content = parsedResponse.output.choices[0].message.content;
                        
                        // Handle both string and array content
                        if (typeof content === 'string') {
                            description = content;
                        } else if (Array.isArray(content)) {
                            // If content is an array, find text element
                            const textElement = content.find(item => item.text);
                            description = textElement ? textElement.text : '';
                        }
                    }

                    if (!description) {
                        reject(new Error('No description found in API response'));
                        return;
                    }

                    // Clean up the description (remove extra whitespace, quotes, etc.)
                    description = description.trim().replace(/^["']|["']$/g, '');
                    
                    console.log('Generated description:', description);
                    resolve(description);

                } catch (parseError) {
                    reject(new Error(`Failed to parse API response: ${parseError.message}`));
                }
            });
        });

        // Handle request errors
        req.on('error', (error) => {
            reject(new Error(`HTTP request failed: ${error.message}`));
        });

        // Set timeout
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        // Write request body
        req.write(JSON.stringify(requestBody));
        req.end();
    });
}
