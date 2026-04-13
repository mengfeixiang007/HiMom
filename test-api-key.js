/**
 * DashScope API Key 测试程序
 * 用于验证 API Key 是否有效
 */

const https = require('https');

// 你的 API Key
const API_KEY = 'sk-74ab4c8314f74bc481a9001154e5413c';

console.log('=== DashScope API Key 测试 ===\n');
console.log('正在测试 API Key:', API_KEY.substring(0, 8) + '...');
console.log('');

// 创建一个简单的测试图片（1x1 像素的红色方块）
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

// 准备请求数据
const requestBody = {
    model: 'qwen-vl-plus',
    input: {
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant.'
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'image',
                        image: 'data:image/png;base64,' + testImageBase64
                    },
                    {
                        type: 'text',
                        text: 'What is in this image?'
                    }
                ]
            }
        ]
    },
    parameters: {
        max_tokens: 50
    }
};

console.log('正在调用 Qwen VL API...');
console.log('');

// 准备请求选项
const options = {
    hostname: 'dashscope.aliyuncs.com',
    port: 443,
    path: '/api/v1/services/aigc/multimodal-generation/generation',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'TestScript/1.0'
    }
};

// 发送请求
const req = https.request(options, (res) => {
    let responseData = '';

    console.log('HTTP 状态码:', res.statusCode);
    console.log('响应头:', JSON.stringify(res.headers, null, 2));
    console.log('');

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('=== 响应结果 ===');
        
        try {
            const parsedResponse = JSON.parse(responseData);
            
            // 检查是否有错误
            if (parsedResponse.code || parsedResponse.error_code) {
                console.error('❌ API 调用失败！');
                console.error('错误代码:', parsedResponse.code || parsedResponse.error_code);
                console.error('错误信息:', parsedResponse.message || parsedResponse.error_message);
                console.error('');
                console.error('完整响应:');
                console.error(JSON.stringify(parsedResponse, null, 2));
                console.log('');
                console.log('💡 建议：');
                console.log('   1. 检查 API Key 是否正确');
                console.log('   2. 确认账户有可用额度');
                console.log('   3. 访问 https://dashscope.console.aliyun.com/ 查看状态');
                return;
            }
            
            // 成功
            console.log('✅ API Key 有效！');
            console.log('');
            console.log('AI 回复:');
            
            if (parsedResponse.output && 
                parsedResponse.output.choices && 
                parsedResponse.output.choices[0]) {
                const content = parsedResponse.output.choices[0].message.content;
                console.log(content);
            } else {
                console.log('无法解析响应内容');
                console.log('完整响应:');
                console.log(JSON.stringify(parsedResponse, null, 2));
            }
            
            console.log('');
            console.log('🎉 测试完成！你的 API Key 可以正常使用。');
            
        } catch (error) {
            console.error('❌ 解析响应失败:', error.message);
            console.error('');
            console.error('原始响应:');
            console.error(responseData);
        }
    });
});

// 错误处理
req.on('error', (error) => {
    console.error('❌ 网络请求失败:', error.message);
    console.error('');
    console.error('请检查网络连接是否正常');
});

// 设置超时
req.setTimeout(30000, () => {
    req.destroy();
    console.error('❌ 请求超时（30秒）');
    console.error('请检查网络连接或稍后重试');
});

// 发送请求体
req.write(JSON.stringify(requestBody));
req.end();

console.log('请求已发送，等待响应...\n');
