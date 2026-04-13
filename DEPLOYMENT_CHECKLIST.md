# Deployment Checklist for Hi'Mom

Use this checklist to ensure everything is ready before deploying!

## ✅ Pre-Deployment Checks

### 1. API Key Setup
- [ ] Sign up for DashScope account at https://dashscope.console.aliyun.com/
- [ ] Generate an API key
- [ ] Copy the key (starts with "sk-")
- [ ] Keep it secure!

### 2. Code Review
- [ ] All files are present (see file list below)
- [ ] No sensitive data in code (API keys should use environment variables)
- [ ] `.env` file is in `.gitignore` (not committed)
- [ ] Test locally if possible

### 3. EdgeOne Pages Setup
- [ ] Create EdgeOne account (if you don't have one)
- [ ] Install EdgeOne CLI: `npm install -g @edgeone/cli`
- [ ] Login: `edgeone login`
- [ ] Navigate to project folder: `cd HiMom`

### 4. Environment Variables
- [ ] In EdgeOne console, go to your project settings
- [ ] Add environment variable: `DASHSCOPE_API_KEY`
- [ ] Paste your API key as the value
- [ ] Save changes

### 5. Deploy
```bash
# From the HiMom directory
edgeone pages deploy .
```

- [ ] Wait for deployment to complete
- [ ] Note your deployed URL

### 6. Post-Deployment Testing
- [ ] Open your deployed URL on mobile phone
- [ ] Grant camera permissions when prompted
- [ ] See camera feed on screen
- [ ] Double-tap on an object
- [ ] Wait 2-5 seconds
- [ ] Hear voice description
- [ ] See subtitle text appear
- [ ] Test multiple objects

### 7. PWA Installation
- [ ] On iOS: Use Safari, tap Share → Add to Home Screen
- [ ] On Android: Use Chrome, menu → Add to Home Screen
- [ ] Open from home screen icon
- [ ] Verify app works in standalone mode

## 📋 Required Files Checklist

Make sure ALL these files are present:

**Root Files:**
- [x] index.html - Main page
- [x] style.css - Styles
- [x] script.js - Main logic
- [x] offline.html - Offline fallback
- [x] manifest.json - PWA manifest
- [x] sw.js - Service Worker
- [x] package.json - NPM config
- [x] edgeone.json - EdgeOne config
- [x] README.md - Documentation
- [x] QUICKSTART.md - Quick start guide
- [x] .gitignore - Git ignore rules
- [x] .env.example - Environment template

**Modules:**
- [x] modules/camera.js - Camera control
- [x] modules/vision.js - AI API calls
- [x] modules/speech.js - Text-to-speech
- [x] modules/conversation.js - Future feature placeholder

**Functions:**
- [x] functions/api/describe.js - Cloud function

## 🔍 Testing Checklist by Feature

### Camera Module
- [ ] Camera permission requested on load
- [ ] Rear camera preferred on mobile
- [ ] Full-screen video display
- [ ] Permission denied message shows if rejected
- [ ] Video covers entire screen (object-fit: cover)

### Double-Tap Interaction
- [ ] Single tap does nothing
- [ ] Double-tap triggers recognition
- [ ] Loading overlay appears during processing
- [ ] Status icon (👂) animates on tap
- [ ] Error messages show if something fails

### AI Recognition
- [ ] Image captured and compressed
- [ ] Sent to cloud function
- [ ] Qwen VL processes image
- [ ] Returns English description (10-20 words)
- [ ] Description is toddler-friendly language

### Speech Output
- [ ] Voice speaks the description
- [ ] Uses female English voice (when available)
- [ ] Speech rate is 0.9 (slightly slower)
- [ ] Audio plays clearly
- [ ] Respects device volume settings

### Subtitle Display
- [ ] Text appears at bottom of screen
- [ ] White text on semi-transparent black background
- [ ] Shows for 3 seconds
- [ ] Fades out smoothly
- [ ] Doesn't block main view

### PWA Features
- [ ] App can be added to home screen
- [ ] Works offline (shows offline page)
- [ ] Theme color applies (black)
- [ ] Icon displays correctly
- [ ] Loads quickly from cache

### UI/UX
- [ ] Dark theme throughout
- [ ] Loading spinner visible
- [ ] "Looking..." text shows during processing
- [ ] Smooth animations
- [ ] Responsive on different screen sizes
- [ ] iOS warning shows on iOS devices

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Camera not working | Check HTTPS, permissions, browser compatibility |
| Speech not playing | iOS requires user gesture, check volume |
| AI timeout | Check internet, API key validity |
| Function errors | Verify DASHSCOPE_API_KEY is set |
| CORS errors | Ensure proper headers in cloud function |
| PWA not installing | Must be served over HTTPS |

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ App loads without errors
- ✅ Camera shows live feed
- ✅ Double-tap triggers AI recognition
- ✅ Voice describes objects in English
- ✅ Subtitles appear and disappear
- ✅ Can be added to home screen
- ✅ Works consistently across sessions

## 📞 Need Help?

If you encounter issues:
1. Check browser console for error messages
2. Verify API key is correct and active
3. Test on different devices/browsers
4. Review EdgeOne deployment logs
5. Check network tab for failed requests

---

**Remember**: The first deployment might take a few tries. Don't give up! 🚀

Once everything works, share it with your little ones and watch them learn! 🎉
