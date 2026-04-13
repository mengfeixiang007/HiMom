# Quick Start Guide for Hi'Mom

## 🚀 Getting Started in 3 Steps

### Step 1: Get Your DashScope API Key

1. Visit: https://dashscope.console.aliyun.com/
2. Sign up or log in
3. Create a new API key
4. Copy the key (it starts with "sk-")

### Step 2: Deploy to EdgeOne Pages

**Option A: Using EdgeOne CLI**

```bash
# Install EdgeOne CLI globally
npm install -g @edgeone/cli

# Navigate to project folder
cd HiMom

# Login to your EdgeOne account
edgeone login

# Deploy the project
edgeone pages deploy .

# Set environment variable in EdgeOne console
# Add: DASHSCOPE_API_KEY = your_api_key_here
```

**Option B: Using GitHub Integration**

1. Push this code to a GitHub repository
2. Connect your repo to EdgeOne Pages
3. Set environment variable `DASHSCOPE_API_KEY` in the dashboard
4. Deploy automatically on push

### Step 3: Use the App

1. Open your deployed URL on mobile phone
2. Allow camera permissions
3. Point camera at objects
4. Double-tap screen to identify and hear descriptions!

---

## 💻 Local Testing (Optional)

If you want to test locally before deploying:

```bash
# Using npm script (installs http-server automatically)
npm start

# Or using Python (if installed)
npm run serve

# Then visit: http://localhost:8000
```

**Note**: AI features won't work locally without setting up the cloud function, but you can test the UI and camera.

---

## 📱 Adding to Home Screen

### iOS (Safari)
1. Open your app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Name it "Hi'Mom" and tap Add

### Android (Chrome)
1. Open your app in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home Screen"
4. Name it "Hi'Mom" and tap Add

---

## 🔧 Troubleshooting

**Camera not working?**
- Make sure you granted camera permissions
- Try refreshing the page
- Use HTTPS (required for camera access)

**Speech not playing?**
- Check your device volume
- On iOS, you may need to tap the screen once first
- Make sure silent mode is off

**AI not responding?**
- Verify your API key is set correctly
- Check your internet connection
- Look at browser console for errors

**App not loading?**
- Clear browser cache
- Check your internet connection
- Try a different browser

---

## 💡 Tips for Best Experience

- Use in good lighting for better recognition
- Hold camera steady when double-tapping
- Works best with distinct objects (toys, fruits, animals)
- Keep objects centered in frame
- Wait for speech to finish before next tap

---

## 🎯 What Happens When You Double-Tap?

1. 📸 Camera captures current frame
2. 🖼️ Image compressed to JPEG (quality 70%)
3. ☁️ Sent to cloud function
4. 🤖 Qwen VL analyzes the image
5. 📝 AI generates simple English description
6. 🔊 Browser speaks the description
7. 📖 Text appears as subtitle

The whole process takes 2-5 seconds depending on network speed!

---

## 🌟 Customization Ideas

Want to make it your own? Try:

- Changing the voice (edit `modules/speech.js`)
- Modifying the AI prompt (edit `functions/api/describe.js`)
- Adjusting colors (edit `style.css`)
- Adding sound effects
- Supporting multiple languages

Have fun teaching your little one! 🎉
