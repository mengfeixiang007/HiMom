# Hi'Mom - AI-Powered Visual Learning Assistant

A Progressive Web App (PWA) that helps toddlers learn English by identifying objects through the camera and speaking descriptions using AI.

## 🌟 Features

- **Real-time Camera Preview**: Full-screen rear camera access
- **AI Object Recognition**: Double-tap to identify objects using Qwen VL vision model
- **English Speech Output**: Natural text-to-speech with gentle, toddler-friendly voice
- **Offline Support**: PWA capabilities with service worker caching
- **Dark Theme**: Minimal, battery-friendly design
- **Cross-platform**: Works on iOS Safari and Android Chrome

## 📱 How to Use

1. **Grant Camera Permission**: Allow camera access when prompted
2. **Point at Objects**: Aim your camera at any object
3. **Double-Tap**: Tap twice on the screen to analyze what you see
4. **Listen & Learn**: Hear the AI describe the object in simple English

## 🚀 Quick Start

### Local Development

You can run this app locally using a simple HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js (http-server package)
npx http-server -p 8000

# Then open http://localhost:8000 in your browser
```

### Deploy to EdgeOne Pages

1. **Set up Environment Variable**:
   - Go to EdgeOne Pages console
   - Add environment variable: `DASHSCOPE_API_KEY` with your API key
   - Get your API key from: https://dashscope.console.aliyun.com/

2. **Deploy**:
   ```bash
   # Install EdgeOne CLI (if not already installed)
   npm install -g @edgeone/cli
   
   # Deploy from project directory
   edgeone pages deploy .
   ```

3. **Access Your App**:
   - Visit your deployed URL
   - Add to home screen for full PWA experience

## 📂 Project Structure

```
HiMom/
├── index.html              # Main HTML file
├── style.css               # Styles and animations
├── script.js               # Main app logic
├── offline.html            # Offline fallback page
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── modules/
│   ├── camera.js           # Camera control module
│   ├── vision.js           # AI vision API calls
│   ├── speech.js           # Text-to-speech module
│   └── conversation.js     # Future conversation module
├── functions/
│   └── api/
│       └── describe.js     # EdgeOne cloud function
└── README.md               # This file
```

## 🔧 Configuration

### Getting DashScope API Key

1. Visit [DashScope Console](https://dashscope.console.aliyun.com/)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key and add it to EdgeOne Pages environment variables as `DASHSCOPE_API_KEY`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DASHSCOPE_API_KEY` | Your DashScope API key for Qwen VL | Yes |

## 🎨 Customization

### Replace Placeholder Icon

The app currently uses an emoji (🎤) as a placeholder icon. To replace it:

1. Create actual icon files (PNG format recommended)
2. Place them in an `/icons` folder
3. Update `manifest.json` to reference your icons:
   ```json
   "icons": [
     {
       "src": "/icons/icon-192.png",
       "sizes": "192x192",
       "type": "image/png"
     },
     {
       "src": "/icons/icon-512.png",
       "sizes": "512x512",
       "type": "image/png"
     }
   ]
   ```

### Adjust Speech Settings

Edit `modules/speech.js` to change:
- `rate`: Speech speed (0.1-10, default: 0.9)
- `pitch`: Voice pitch (0-2, default: 1.0)
- Voice selection logic

### Modify AI Prompt

Edit the system prompt in `functions/api/describe.js` to change how the AI describes objects.

## 🐛 Troubleshooting

### Camera Not Working
- Ensure you've granted camera permissions
- Try refreshing the page
- On iOS, use Safari for best compatibility

### Speech Not Playing
- Mobile browsers require user interaction (double-tap counts!)
- Check device volume settings
- iOS may require tapping the screen once before audio works

### "You're Offline" Message
- Check your internet connection
- The app needs internet to analyze images via AI
- Basic app functionality is cached for offline viewing

### iOS Specific Issues
- Use Safari browser
- Add to Home Screen for better PWA support
- Some features may be limited in iOS WebView

## 📝 API Usage & Costs

This app uses Alibaba Cloud's DashScope API (Qwen VL model). Pricing varies based on usage:

- Free tier available for testing
- Pay-as-you-go for production use
- Check current pricing at: https://help.aliyun.com/pricing/dashscope

## 🔒 Privacy & Security

- Images are only sent to the AI API when you double-tap
- No data is stored permanently
- All API calls use HTTPS
- API keys are stored securely in environment variables

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **AI**: Qwen VL Plus (Alibaba DashScope)
- **Speech**: Browser built-in SpeechSynthesis API
- **Deployment**: Tencent EdgeOne Pages (Serverless)
- **PWA**: Service Worker + Web App Manifest

## 📄 License

This project is created for educational purposes. Feel free to modify and distribute.

## 🤝 Contributing

Suggestions and improvements are welcome! This is a learning-focused project.

## 📞 Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Verify your API key is valid
3. Ensure your browser supports required features
4. Check browser console for error messages

---

**Made with ❤️ for curious little minds**
