/**
 * Vercel Serverless Function - AI Image Description
 * This function handles POST requests to /api/describe
 */

const https = require('https');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
    }

    try {
        console.log('=== HiMom Vercel Function Started ===');

        // Parse request body
        const { image } = req.body;

        if (!image) {
            res.status(400).json({
                error: 'Missing image in request body'
            });
            return;
        }

        console.log('Image received, length:', image.length);

        // API Key - 直接使用
        const apiKey = 'sk-74ab4c8314f74bc481a9001154e5413c';
        console.log('Using API Key:', apiKey.substring(0, 8) + '...');

        // Extract pure base64 data
        const pureBase64 = image.replace(/^data:image\/jpeg;base64,/, '');

        // Call Qwen VL API
        const description = await callQwenVL(pureBase64, apiKey);

        console.log('Success! Description:', description);

        // Return result
        res.status(200).json({
            description: description
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error: ' + error.message
        });
    }
};

/**
 * Call Qwen VL Plus API
 */
function callQwenVL(base64Image, apiKey) {
    return new Promise((resolve, reject) => {
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

        const options = {
            hostname: 'dashscope.aliyuncs.com',
            port: 443,
            path: '/api/v1/services/aigc/multimodal-generation/generation',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'HiMom-Vercel/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedResponse = JSON.parse(responseData);

                    if (parsedResponse.code || parsedResponse.error_code) {
                        const errorMsg = parsedResponse.message || parsedResponse.error_message || 'Unknown API error';
                        reject(new Error(`Qwen API Error: ${errorMsg}`));
                        return;
                    }

                    let description = '';
                    
                    if (parsedResponse.output && 
                        parsedResponse.output.choices && 
                        parsedResponse.output.choices[0] && 
                        parsedResponse.output.choices[0].message &&
                        parsedResponse.output.choices[0].message.content) {
                        
                        const content = parsedResponse.output.choices[0].message.content;
                        
                        if (typeof content === 'string') {
                            description = content;
                        } else if (Array.isArray(content)) {
                            const textElement = content.find(item => item.text);
                            description = textElement ? textElement.text : '';
                        }
                    }

                    if (!description) {
                        reject(new Error('No description found in API response'));
                        return;
                    }

                    resolve(description.trim());

                } catch (parseError) {
                    reject(new Error(`Failed to parse API response: ${parseError.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`HTTP request failed: ${error.message}`));
        });

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(JSON.stringify(requestBody));
        req.end();
    });
}
