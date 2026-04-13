/**
 * 本地测试云函数
 * 模拟前端请求测试云函数
 */

const https = require('https');
const fs = require('fs');

// API Key
const API_KEY = 'sk-74ab4c8314f74bc481a9001154e5413c';

console.log('=== 本地测试云函数 ===\n');

// 创建一个测试图片（读取一个小图片文件，或者使用 base64）
// 这里使用一个真实的测试图片 base64（一个小的红色方块）
const testImageBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';

// 构造请求体
const requestBody = {
    image: 'data:image/jpeg;base64,' + testImageBase64
};

console.log('正在调用云函数...');
console.log('图片大小:', testImageBase64.length, 'bytes');
console.log('');

// 调用 Qwen VL API（和云函数一样的逻辑）
callQwenVL(testImageBase64, API_KEY)
    .then(description => {
        console.log('✅ 成功！');
        console.log('AI 描述:', description);
    })
    .catch(error => {
        console.error('❌ 失败:', error.message);
    });

/**
 * Call Qwen VL Plus API for image description
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
                'User-Agent': 'HiMom-Test/1.0'
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
                        reject(new Error(`API Error: ${errorMsg}`));
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
                        reject(new Error('No description found in response'));
                        return;
                    }

                    resolve(description.trim());

                } catch (parseError) {
                    reject(new Error(`Parse error: ${parseError.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.write(JSON.stringify(requestBody));
        req.end();
    });
}
