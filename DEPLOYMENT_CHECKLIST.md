# Deployment Checklist for Kateno AI

## 🚨 CRITICAL: Two Steps Required for Production

### Step 1: Deploy Firebase Security Rules

**Problem:** "Missing or insufficient permissions" errors

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `fir-config-d3c36`
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy ALL content from `firestore.rules` file
5. Paste into Firebase Console
6. **Click "Publish"**
7. Wait 30 seconds for propagation

### Step 2: Add Groq API Key

**Problem:** 502 errors - Previous API provider (BlackBox AI) exceeded budget

**Solution:**
1. Get free API key from: https://console.groq.com (takes 2 minutes)
2. **For Local Dev:**
   - Add to `.env.local`: `GROQ_API_KEY=gsk_your_key_here`
3. **For Vercel Production:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `GROQ_API_KEY` = `gsk_your_key_here`
   - **Redeploy the app**

See `GET_GROQ_KEY.md` for detailed steps.

---

## Changes Made in This Fix

### 1. ✅ Fixed Firebase Permissions

**Updated `firestore.rules`:**
- Now properly validates userId matches authenticated user
- Removed conflicting rules
- Added proper read/write restrictions

**Files Modified:**
- `firestore.rules` - Improved security rules
- `firebase.json` - Added Firebase config
- `.firebaserc` - Added project reference

### 2. ✅ Switched to Groq AI Provider

**Before:** BlackBox AI (budget exceeded, 502 errors)

**After:** Groq with Llama 3.3 70B (free tier, production ready)

**Why Groq:**
- ✅ Free tier: 30 requests/min
- ✅ Fast: < 1 second response
- ✅ Powerful: Llama 3.3 70B (GPT-4 level)
- ✅ Reliable: Production grade infrastructure
- ✅ No credit card required

**Files Modified:**
- `src/lib/ai/provider.ts` - Switched from BlackBox to Groq
- `.env.local` - Added GROQ_API_KEY variable
- `.env.example` - Updated with Groq instructions

### 3. ✅ Production-Grade Error Handling

**Improvements:**
- Better error messages show exact issue (API key missing, etc.)
- Proper streaming error handling
- Detailed logging for debugging

## Verification Steps

### After Deployment:

1. **Check Firebase Permissions:**
   - Open https://kateno-ai.vercel.app/
   - Press F12 to open console
   - Sign in with Google or email
   - Verify NO "Missing or insufficient permissions" errors

2. **Test AI Chat:**
   - Send a message in the chat
   - Verify you get a response from DeepSeek model
   - Check that streaming works properly

3. **Test Conversation Persistence:**
   - Create a new conversation
   - Refresh the page
   - Verify the conversation is saved and loads correctly

4. **Test Settings:**
   - Open settings modal
   - Change theme
   - Refresh page
   - Verify settings are persisted

## Build & Deploy

The application is ready to deploy to Vercel. No additional configuration needed.

```bash
# Vercel will automatically run:
npm install
npm run build
```

## Important Notes

1. **Private Repository:** API key is hardcoded, so keep the repository private
2. **No Environment Variables:** Don't need to set anything in Vercel project settings
3. **Firebase Rules:** MUST be updated in Firebase Console (see above)
4. **Fallback:** If BlackBox AI fails, the app falls back to mock mode

## Deployment Link

Production: https://kateno-ai.vercel.app/

## Support

If you encounter any issues:
1. Check browser console (F12) for errors
2. Verify Firebase rules are published
3. Check Vercel deployment logs
4. Ensure build completes successfully
