# ⚡ Quick Start - Fix All Errors in 5 Minutes

## Current Errors You're Seeing

```
❌ Error fetching user settings: Missing or insufficient permissions
❌ Error fetching conversations: Missing or insufficient permissions  
❌ /api/chat: 502 Failed to load resource
❌ Chat error: Failed to send message
```

## Fix in 2 Steps

### Step 1: Deploy Firebase Rules (2 minutes)

1. Open: https://console.firebase.google.com/
2. Select project: `fir-config-d3c36`
3. Click: **Firestore Database** → **Rules** tab
4. Copy everything from the `firestore.rules` file in this repo
5. Paste into the editor in Firebase Console
6. Click **"Publish"**
7. ✅ Wait 30 seconds

### Step 2: Add Groq API Key (3 minutes)

1. Open: https://console.groq.com
2. Sign up with GitHub/Google (1 click)
3. Click "Create API Key"
4. Copy the key (starts with `gsk_...`)

5. **Add to project:**

   **Local Dev:**
   ```bash
   # Edit .env.local file
   GROQ_API_KEY=gsk_paste_your_key_here
   ```

   **Vercel Production:**
   - Vercel Dashboard → Settings → Environment Variables
   - Add: `GROQ_API_KEY` = `gsk_paste_your_key_here`
   - Redeploy

## Test It Works

```bash
npm run dev
```

1. Open http://localhost:3000
2. Sign in
3. Ask: **"Give a code for fibonacci series in python"**
4. ✅ Should get actual Python code (not an error!)

## All Errors Should Be Fixed Now ✅

- ✅ No more "Missing or insufficient permissions"
- ✅ No more 502 errors
- ✅ No more "Failed to send message"
- ✅ AI actually responds with real code/answers
- ✅ Chat history saves correctly
- ✅ Settings persist

---

Need help? See `SETUP_GUIDE.md` for detailed troubleshooting.
