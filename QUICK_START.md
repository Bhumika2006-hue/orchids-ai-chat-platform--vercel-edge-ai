# ⚡ Quick Start - Deploy in 2 Steps

## Step 1: Deploy to Vercel (Automatic)
```bash
git push origin main
```
That's it! Vercel will automatically build and deploy.
**No environment variables needed.**

## Step 2: Fix Firebase Permissions (Manual - 30 seconds)

### Instructions:
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **fir-config-d3c36**
3. Go to **Firestore Database** → **Rules** tab
4. Copy everything from the `firestore.rules` file
5. Paste into Firebase Console
6. Click **Publish**

### The rules (copy this):
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Allow authenticated users to read and write their own settings
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Done! 🎉

Visit: **https://kateno-ai.vercel.app/**

### What You Get:
- ✅ AI chat with DeepSeek model (via BlackBox AI)
- ✅ User authentication (Google + Email)
- ✅ Persistent conversations
- ✅ Context memory
- ✅ Theme switching
- ✅ No environment variables to configure

### Verify It's Working:
1. Open the site
2. Press F12 (browser console)
3. Sign in
4. Check: **NO "Missing or insufficient permissions" errors**
5. Send a message
6. Verify: Response from AI

**If you see permission errors:** You forgot to publish Firestore rules (Step 2 above).

---

## 🔧 Technical Details

**AI Provider:** BlackBox AI with DeepSeek
- API Key: Hardcoded in code (sk-XN13reQfIX-D8rAipMUqSg)
- Model: blackboxai/deepseek/deepseek-chat:free
- No environment variables needed

**Database:** Firebase Firestore
- Project: fir-config-d3c36
- Credentials: Hardcoded with fallbacks
- Rules: Must be manually published (see Step 2)

**Deployment:** Vercel
- URL: https://kateno-ai.vercel.app/
- Auto-deploy from GitHub
- Zero configuration required

---

For more details, see:
- `FINAL_SETUP_INSTRUCTIONS.md` - Complete guide
- `FIRESTORE_SETUP.md` - Firebase setup details
- `DEPLOYMENT_CHECKLIST.md` - Full deployment checklist
