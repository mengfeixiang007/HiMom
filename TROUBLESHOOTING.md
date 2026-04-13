# Troubleshooting Guide for Hi'Mom

Common issues and their solutions, organized by category.

---

## 📷 Camera Issues

### Problem: Camera permission denied

**Symptoms**: Black screen or "Camera access is needed" message

**Solutions**:
1. **Browser Settings**:
   - Chrome: Click lock icon → Site settings → Camera → Allow
   - Safari: Settings → Safari → Camera → Allow for website
   - Firefox: Click permissions icon → Camera → Allow

2. **System Settings**:
   - iOS: Settings → Safari → Camera → Enable
   - Android: Settings → Apps → Chrome → Permissions → Camera → Allow
   - Windows: Settings → Privacy → Camera → Allow apps to access

3. **Try Again**:
   - Refresh the page
   - Clear browser cache
   - Try a different browser

### Problem: Camera shows black screen

**Possible causes**:
- Another app is using the camera
- Camera driver issue
- Browser doesn't support getUserMedia

**Solutions**:
1. Close other apps using camera
2. Restart browser
3. Update browser to latest version
4. Try HTTPS (required for camera)

### Problem: Wrong camera (front instead of rear)

**Solution**: The app requests rear camera (`facingMode: 'environment'`), but if your device doesn't support it:
- Use a device with rear camera
- Manually switch cameras if your browser allows

---

## 🔊 Speech/Audio Issues

### Problem: No sound when object is recognized

**Common on iOS**: Safari requires user interaction before playing audio

**Solutions**:
1. Tap anywhere on screen once (before double-tapping)
2. Check device volume is not muted
3. Turn off silent mode (iOS)
4. Increase media volume

**Check**:
```javascript
// In browser console, test speech support:
console.log('speechSynthesis' in window); // Should be true
speechSynthesis.getVoices().length; // Should be > 0
```

### Problem: Voice sounds robotic or unclear

**Causes**: Browser/OS text-to-speech quality varies

**Solutions**:
1. Try different browsers (Chrome usually has better voices)
2. On mobile, ensure language pack is downloaded
3. Adjust speech rate in `modules/speech.js`:
   ```javascript
   utterance.rate = 0.8; // Slower (0.1 to 10)
   utterance.pitch = 1.2; // Higher pitch (0 to 2)
   ```

### Problem: Wrong voice selected

**Solution**: Edit voice selection in `modules/speech.js`:
```javascript
// Find specific voice by name
const preferredVoice = voices.find(voice => 
    voice.name === 'Google US English'
);
```

---

## 🤖 AI Recognition Issues

### Problem: "Looking..." never finishes

**Causes**: Network timeout or API error

**Solutions**:
1. **Check internet connection**
   - Open another website to verify
   - Check WiFi/mobile data is enabled

2. **Verify API key is set**
   - In EdgeOne console: Check environment variable `DASHSCOPE_API_KEY`
   - Ensure no extra spaces in key
   - Key should start with "sk-"

3. **Check API quota**
   - Visit DashScope console
   - Verify you have remaining quota
   - Check billing status

4. **View browser console**
   - Press F12 (desktop) or use remote debugging
   - Look for error messages
   - Check Network tab for failed requests

### Problem: Recognition takes too long (>10 seconds)

**Causes**: Slow network or large image

**Solutions**:
1. Improve internet connection
2. Reduce image size in `modules/camera.js`:
   ```javascript
   const base64Image = camera.captureFrame(600, 0.6); // Smaller
   ```
3. Check server response time in Network tab

### Problem: Incorrect object identification

**This is expected sometimes** - AI isn't perfect!

**Improve accuracy**:
1. Good lighting
2. Hold camera steady
3. Center object in frame
4. Clear, distinct objects work best
5. Avoid blurry images

**Note**: The AI describes what it sees, which may not always match your expectation.

### Problem: Same object, different descriptions

**This is normal!** Qwen VL generates varied responses each time.

**Benefits**:
- Exposes children to different vocabulary
- More engaging than repetitive answers

**If you want consistency**: Modify the API call to use temperature=0.3 in `functions/api/describe.js`

---

## 📱 PWA/Installation Issues

### Problem: Can't add to home screen

**iOS Requirements**:
- Must use Safari browser
- App must have valid manifest.json
- Service worker must be registered
- Must be served over HTTPS

**Android Requirements**:
- Must use Chrome or supported browser
- Valid manifest.json required
- Service worker must be active
- HTTPS required

**Solutions**:
1. Ensure you're using latest Safari/Chrome
2. Check URL starts with https://
3. Clear browser data and try again
4. Verify manifest.json loads: Visit `/manifest.json`

### Problem: App looks different when installed

**Cause**: Standalone mode may have different viewport

**Solutions**:
1. Test in both browser and standalone modes
2. Adjust CSS in `style.css` for different displays
3. Check viewport meta tag in `index.html`

### Problem: Installed app won't load

**Solutions**:
1. Uninstall and reinstall
2. Clear app data:
   - iOS: Settings → General → iPhone Storage → Hi'Mom → Delete App
   - Android: Settings → Apps → Hi'Mom → Storage → Clear Data
3. Check internet connection
4. Re-deploy latest version

---

## 🌐 Deployment Issues

### Problem: EdgeOne deployment fails

**Common errors**:

**"Build failed"**
- Check all files are present
- Verify JSON files are valid (no syntax errors)
- Remove any `.env` files (use environment variables)

**"Function error"**
- Verify `DASHSCOPE_API_KEY` is set
- Check function syntax in `functions/api/describe.js`
- View deployment logs for details

**"Not found" after deploy**
- Wait 1-2 minutes for propagation
- Check you deployed from correct directory
- Verify `index.html` exists in root

### Problem: CORS errors

**Symptoms**: Console shows "Cross-Origin Request Blocked"

**Solution**: Already handled in `describe.js` with CORS headers. If still occurring:
```javascript
// These headers are already set:
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'POST, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type'
```

### Problem: Function returns 500 error

**Causes**: API key invalid or missing

**Solutions**:
1. Check environment variable name is exactly `DASHSCOPE_API_KEY`
2. Verify API key is valid (test in DashScope console)
3. Redeploy after setting variable
4. Check function logs in EdgeOne console

---

## 💻 Development Issues

### Problem: Local testing doesn't work

**File protocol limitations**: Browsers block camera on `file://`

**Solution**: Use local server:
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000

# Then visit http://localhost:8000
```

### Problem: ES6 modules not loading

**Cause**: MIME type issues or wrong path

**Solutions**:
1. Ensure `<script type="module">` in HTML
2. Use correct file paths (relative or absolute)
3. Serve with proper MIME types
4. Check browser console for import errors

### Problem: Changes not appearing

**Cause**: Service Worker caching

**Solutions**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear service worker:
   - Chrome: DevTools → Application → Service Workers → Unregister
   - Then reload page
3. Update cache version in `sw.js`:
   ```javascript
   const CACHE_NAME = 'himom-cache-v2'; // Increment number
   ```

---

## 🔍 Debugging Tips

### Enable Debug Mode

Add to top of `script.js`:
```javascript
localStorage.setItem('debug', 'true');
```

Then add logging:
```javascript
if (localStorage.getItem('debug')) {
    console.log('Detailed debug info:', data);
}
```

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Double-tap to trigger recognition
4. Look for:
   - POST to `/api/describe`
   - Status code (should be 200)
   - Response body contains `{ description: "..." }`

### Test Individual Modules

**Test Camera**:
```javascript
// In console
import('./modules/camera.js').then(m => {
    m.default.start().then(console.log);
});
```

**Test Speech**:
```javascript
// In console
import('./modules/speech.js').then(m => {
    m.speakText('Testing speech module');
});
```

**Test Vision**:
```javascript
// In console (needs valid image)
import('./modules/vision.js').then(m => {
    m.describeImage('data:image/jpeg;base64,...').then(console.log);
});
```

### View Service Worker Logs

1. Chrome: `chrome://serviceworker-internals/`
2. Find your service worker
3. Click "Inspect"
4. View console logs

---

## 📊 Performance Issues

### Problem: App loads slowly

**Solutions**:
1. Check network speed
2. Enable gzip compression on server
3. Optimize images (already done)
4. Use CDN (EdgeOne provides this)

### Problem: High memory usage

**Causes**: Video stream not released

**Solution**: Already handled in `camera.js` with proper cleanup. If still high:
```javascript
// Add to camera.stop() method
this.videoElement.srcObject = null;
```

### Problem: Battery drain

**Normal behavior**: Camera + AI processing uses battery

**Reduce usage**:
1. Close app when not in use
2. Reduce screen brightness
3. Limit continuous recognition sessions

---

## 🎯 Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Camera | ✅ | ✅ | ✅ | ✅ |
| Speech | ✅ | ⚠️ Limited | ✅ | ✅ |
| PWA | ✅ | ⚠️ iOS 11.3+ | ❌ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Canvas | ✅ | ✅ | ✅ | ✅ |

**Best experience**: Chrome on Android, Safari on iOS

---

## 🆘 Emergency Recovery

### App completely broken?

**Quick fixes**:
1. **Clear everything**:
   ```javascript
   // In console
   caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
   navigator.serviceWorker.getRegistrations().then(regs => 
       regs.forEach(r => r.unregister())
   );
   localStorage.clear();
   location.reload();
   ```

2. **Revert to working version**:
   - Restore from git backup
   - Redeploy previous version

3. **Start fresh**:
   - Delete all files
   - Re-download/recreate project
   - Redeploy

---

## 📞 Still Having Issues?

### Gather Information

Before seeking help, collect:
1. **Browser & version**: (e.g., Chrome 120)
2. **Device & OS**: (e.g., iPhone 13, iOS 17)
3. **Error messages**: From console
4. **Network tab**: Screenshot of failed request
5. **Steps to reproduce**: Exact actions

### Check Resources

- **DashScope Docs**: https://help.aliyun.com/document_detail/dashscope.html
- **EdgeOne Docs**: https://cloud.tencent.com/document/product/1542
- **MDN Web Docs**: https://developer.mozilla.org/

### Common Error Messages Explained

| Error Message | Meaning | Fix |
|---------------|---------|-----|
| "NotAllowedError" | Permission denied | Grant camera/mic permission |
| "NotFoundError" | No camera found | Connect camera, check drivers |
| "NotReadableError" | Camera in use | Close other apps using camera |
| "OverconstrainedError" | Impossible constraints | Lower resolution requirements |
| "TypeError: Failed to fetch" | Network error | Check internet, API endpoint |
| "API key not found" | Missing env variable | Set DASHSCOPE_API_KEY |

---

## ✅ Verification Checklist

After fixing issues, verify:

- [ ] Camera shows live video feed
- [ ] Double-tap triggers loading animation
- [ ] Loading text shows "Looking..."
- [ ] API call succeeds (status 200)
- [ ] Voice speaks description
- [ ] Subtitle appears for 3 seconds
- [ ] Works offline (shows offline page)
- [ ] Can be added to home screen
- [ ] Survives page refresh
- [ ] Works on different devices

---

**Remember**: Most issues are related to permissions, network, or configuration. Take it step by step! 🚀
