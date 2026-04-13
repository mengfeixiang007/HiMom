# Hi'Mom Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Device                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Hi'Mom PWA App                       │   │
│  │                                                       │   │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐       │   │
│  │  │ Camera   │    │  Vision  │    │  Speech  │       │   │
│  │  │ Module   │───>│  Module  │    │  Module  │       │   │
│  │  └──────────┘    └──────────┘    └──────────┘       │   │
│  │       │                │                │             │   │
│  │       │                │                │             │   │
│  │  ┌────▼────────────────▼────────────────▼──────┐     │   │
│  │  │         Main Controller (script.js)          │     │   │
│  │  └─────────────────────────────────────────────┘     │   │
│  │                                                       │   │
│  │  ┌──────────────────────────────────────────┐       │   │
│  │  │      Service Worker (sw.js)              │       │   │
│  │  │  - Cache Management                      │       │   │
│  │  │  - Offline Support                       │       │   │
│  │  └──────────────────────────────────────────┘       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS Request
                           │ (Base64 Image)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   EdgeOne Pages (Cloud)                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Cloud Function: /api/describe.js                 │    │
│  │                                                     │    │
│  │   1. Receive Base64 image                          │    │
│  │   2. Extract pure Base64 data                      │    │
│  │   3. Call Qwen VL API with system prompt           │    │
│  │   4. Parse AI response                             │    │
│  │   5. Return English description                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ API Call
                           │ (with API Key)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Alibaba DashScope (Qwen VL API)                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Model: qwen-vl-plus                              │    │
│  │                                                     │    │
│  │   Input: Image (Base64)                            │    │
│  │   Prompt: "You are a gentle mother..."             │    │
│  │                                                     │    │
│  │   Output: "Look! A fluffy white bunny..."          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

### 1. App Initialization

```
User Opens App
      │
      ▼
┌─────────────┐
│ index.html  │ ──> Load CSS & JS
└─────────────┘
      │
      ▼
┌─────────────┐
│  script.js  │ ──> Register Service Worker
└─────────────┘
      │
      ▼
┌─────────────┐
│ camera.js   │ ──> Request camera permission
└─────────────┘
      │
      ▼
┌─────────────┐
│ Video Feed  │ ──> Display full-screen
└─────────────┘
```

### 2. Double-Tap Recognition Flow

```
User Double-Taps Screen
        │
        ▼
┌──────────────┐
│  script.js   │ ──> Detect double-tap event
└──────────────┘
        │
        ▼
┌──────────────┐
│ Show Loading  │ ──> Overlay with spinner
└──────────────┘
        │
        ▼
┌──────────────┐
│  camera.js   │ ──> captureFrame()
└──────────────┘
        │
        ├─ Capture current video frame
        ├─ Resize to max 800px width
        ├─ Compress to JPEG (quality 0.7)
        └─ Convert to Base64
        │
        ▼
┌──────────────┐
│  vision.js   │ ──> describeImage(base64)
└──────────────┘
        │
        ▼
   POST /api/describe
   Body: { image: "data:image/jpeg;base64,..." }
        │
        ▼
┌──────────────────┐
│ describe.js      │ ──> EdgeOne Cloud Function
│ (Serverless)     │
└──────────────────┘
        │
        ├─ Extract Base64 data
        ├─ Read DASHSCOPE_API_KEY from env
        └─ Call Qwen VL API
        │
        ▼
┌──────────────────┐
│  Qwen VL Plus    │ ──> Alibaba DashScope
│  (AI Model)      │
└──────────────────┘
        │
        ├─ Analyze image content
        ├─ Apply system prompt
        └─ Generate toddler-friendly description
        │
        ▼
   Response: { description: "A fluffy white bunny..." }
        │
        ◄──────────────────────────────┘
        │
        ▼
┌──────────────┐
│  speech.js   │ ──> speakText(description)
└──────────────┘
        │
        ├─ Create SpeechSynthesisUtterance
        ├─ Set rate: 0.9, lang: en-US
        ├─ Select female English voice
        └─ Speak the description
        │
        ▼
┌──────────────┐
│  script.js   │ ──> showSubtitle(text, 3000)
└──────────────┘
        │
        ├─ Display text at bottom
        └─ Auto-hide after 3 seconds
        │
        ▼
   Ready for Next Interaction
```

## Module Interactions

```
┌────────────────────────────────────────────────────────┐
│                   File Dependencies                     │
│                                                         │
│  index.html                                             │
│    ├── style.css                                        │
│    ├── manifest.json                                    │
│    └── script.js (type="module")                        │
│          ├── modules/camera.js                          │
│          ├── modules/vision.js                          │
│          └── modules/speech.js                          │
│                                                         │
│  sw.js                                                  │
│    └── Caches all static assets                         │
│                                                         │
│  functions/api/describe.js                              │
│    └── Calls external Qwen VL API                       │
└────────────────────────────────────────────────────────┘
```

## Service Worker Cache Strategy

```
Request Type          Strategy           Fallback
─────────────────────────────────────────────────────────
Static Assets         Cache-First        Network → Error
(CSS, JS, HTML)       (Fast)             (Update cache)

API Calls             Network-First      Cache → Error
(/api/describe)       (Fresh data)       (Stale data)

Navigation            Cache-First        Offline Page
(user visits)         (Instant load)     (Friendly UI)
```

## State Management

```
┌─────────────────────────────────────────┐
│         Application States              │
│                                          │
│  Initial State                           │
│  ├─> Camera Permission Pending          │
│  ├─> Camera Permission Granted          │
│  └─> Camera Permission Denied           │
│                                          │
│  Active State                            │
│  ├─> Idle (waiting for input)           │
│  ├─> Processing (analyzing image)       │
│  │   ├─> Loading Visible                │
│  │   ├─> API Call In Progress           │
│  │   └─> Icon Animating                 │
│  └─> Speaking (playing audio)           │
│      ├─> Subtitle Visible               │
│      └─> TTS Playing                    │
│                                          │
│  Error State                             │
│  ├─> Network Error                      │
│  ├─> API Error                          │
│  └─> Permission Error                   │
└─────────────────────────────────────────┘
```

## Security Model

```
┌────────────────────────────────────────────────┐
│              Security Layers                    │
│                                                  │
│  Frontend (Browser)                             │
│  ├─ No sensitive data stored                    │
│  ├─ All API calls use HTTPS                     │
│  └─ User gesture required for audio             │
│                                                  │
│  Backend (EdgeOne)                              │
│  ├─ API key in environment variable             │
│  ├─ Never exposed to client                     │
│  └─ Server-side validation                      │
│                                                  │
│  External (DashScope)                           │
│  ├─ Authenticated requests (Bearer token)       │
│  ├─ Rate limiting enforced                      │
│  └─ Usage tracking & billing                    │
└────────────────────────────────────────────────┘
```

## PWA Lifecycle

```
First Visit
     │
     ├─> Load from network
     ├─> Register Service Worker
     ├─> Install & Activate SW
     └─> Cache static assets
     │
     ▼
Subsequent Visits
     │
     ├─> Load from cache (instant)
     ├─> Check for SW updates
     └─> Update cache in background
     │
     ▼
Offline Mode
     │
     ├─> Serve from cache
     ├─> Show offline page if needed
     └─> Queue API calls (future)
     │
     ▼
Add to Home Screen
     │
     ├─> Meets PWA criteria
     ├─> Shows install prompt
     └─> Runs in standalone mode
```

## Error Handling Flow

```
Any Error Occurs
       │
       ├─ Try Operation
       │     │
       │     ├─ Success ──> Continue flow
       │     └─ Failure
       │           │
       │           ├─ Log to console
       │           ├─ Show user feedback
       │           ├─ Hide loading states
       │           └─ Graceful degradation
       │
       ├─ Network Errors
       │     └─ "Check your connection"
       │
       ├─ API Errors
       │     └─ "Couldn't analyze image, try again"
       │
       ├─ Camera Errors
       │     └─ "Camera access needed"
       │
       └─ Speech Errors
             └─ Silent fail (subtitle still shows)
```

---

This architecture ensures:
✅ **Reliability**: Multiple fallback layers  
✅ **Performance**: Cache-first where possible  
✅ **Security**: Sensitive data protected  
✅ **Maintainability**: Clear module separation  
✅ **Scalability**: Easy to add features  
✅ **User Experience**: Graceful error handling  
