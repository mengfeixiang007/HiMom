/**
 * EdgeOne Cloud Function - AI Image Description
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
        console.log('=== HiMom Cloud Function Started ===');
        console.log('Event:', JSON.stringify(event, null, 2));
        
        // Only accept POST requests
        if (event.request && event.request.method !== 'POST') {
            console.log('Method not allowed:', event.request.method);
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
        
        try {
            // Handle different ways the body might be provided
            if (event.body) {
                requestBody = typeof event.body === 'string' ? event.body : JSON.stringify(event.body);
            } else if (event.request && event.request.body) {
                requestBody = event.request.body;
            } else {
                throw new Error('No request body found');
            }
            
            console.log('Request body received, length:', requestBody.length);
        } catch (parseError) {
            console.error('Failed to parse request body:', parseError);
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Invalid request body: ' + parseError.message
                })
            };
        }

        let parsedBody;
        try {
            parsedBody = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;
        } catch (e) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Invalid JSON in request body'
                })
            };
        }
        
        const base64Image = parsedBody.image;

        // Validate input
        if (!base64Image) {
            console.error('No image provided in request');
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

        console.log('Image received, length:', base64Image.length);

        // Get API key - 直接使用 API Key（测试用）
        const apiKey = 'sk-74ab4c8314f74bc481a9001154e5413c';
        
        console.log('API Key configured: Yes (starts with ' + apiKey.substring(0, 5) + '...)');
        
        if (!apiKey) {
            console.error('DASHSCOPE_API_KEY not configured in environment variables');
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Server configuration error: API key not set. Please configure DASHSCOPE_API_KEY environment variable.'
                })
            };
        }

        // Extract pure base64 data (remove data:image/jpeg;base64, prefix if present)
        const pureBase64 = base64Image.replace(/^data:image\/jpeg;base64,/, '');
        console.log('Pure base64 length:', pureBase64.length);

        // Call Qwen VL API
        let description;
        try {
            description = await callQwenVL(pureBase64, apiKey);
            console.log('Successfully got description:', description);
        } catch (apiError) {
            console.error('Qwen VL API call failed:', apiError);
            return {
                statusCode: 502,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'AI API call failed: ' + apiError.message,
                    details: apiError.toString()
                })
            };
        }

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
        console.error('=== Unhandled Error in describe function ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal server error: ' + error.message,
                stack: error.stack
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

        console.log('Calling Qwen VL API...');

        // Prepare HTTP request options
        const options = {
            hostname: 'dashscope.aliyuncs.com',
            port: 443,
            path: '/api/v1/services/aigc/multimodal-generation/generation',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'HiMom-App/1.0',
                'X-DashScope-SSE': 'disable'
            }
        };

        console.log('Request options:', options.hostname + options.path);

        // Make the HTTPS request
        const req = https.request(options, (res) => {
            let responseData = '';

            console.log('Response status code:', res.statusCode);

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    console.log('Response received, length:', responseData.length);
                    
                    // Parse the response
                    const parsedResponse = JSON.parse(responseData);

                    // Check for errors in the response
                    if (parsedResponse.code || parsedResponse.error_code) {
                        const errorMsg = parsedResponse.message || parsedResponse.error_message || 'Unknown API error';
                        console.error('Qwen API returned error:', errorMsg);
                        reject(new Error(`Qwen API Error: ${errorMsg}`));
                        return;
                    }

                    // Extract the description from the response
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
                        console.error('No description found in API response');
                        console.error('Full response:', JSON.stringify(parsedResponse, null, 2));
                        reject(new Error('No description found in API response'));
                        return;
                    }

                    // Clean up the description
                    description = description.trim().replace(/^["']|["']$/g, '');
                    
                    console.log('Generated description:', description);
                    resolve(description);

                } catch (parseError) {
                    console.error('Failed to parse API response:', parseError);
                    reject(new Error(`Failed to parse API response: ${parseError.message}`));
                }
            });
        });

        // Handle request errors
        req.on('error', (error) => {
            console.error('HTTP request error:', error);
            reject(new Error(`HTTP request failed: ${error.message}`));
        });

        // Set timeout
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout after 30 seconds'));
        });

        // Write request body
        const bodyString = JSON.stringify(requestBody);
        console.log('Sending request body, length:', bodyString.length);
        req.write(bodyString);
        req.end();
    });
}
