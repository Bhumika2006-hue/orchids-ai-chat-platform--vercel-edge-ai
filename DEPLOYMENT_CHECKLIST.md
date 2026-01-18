# Deployment Checklist for Kateno AI

## Changes Made

### 1. ✅ Fixed Firebase Permissions Errors

**Problem:** Console showed "Missing or insufficient permissions" errors for user settings and conversations.

**Solution:** Created `firestore.rules` file with proper security rules.

**Action Required:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `fir-config-d3c36`
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the content from `firestore.rules` and paste it
5. Click **Publish**

See `FIRESTORE_SETUP.md` for detailed instructions.

### 2. ✅ Replaced AI Model with DeepSeek

**Before:** Used OpenAI's gpt-4o-mini (required OPENAI_API_KEY environment variable)

**After:** Now using BlackBox AI with DeepSeek model (blackboxai/deepseek/deepseek-chat:free)

**Changes:**
- Hardcoded API key in the code (no environment variables needed)
- Updated AI provider from 'openai' to 'deepseek'
- Implemented custom BlackBox AI streaming function
- Updated all configuration files

**Files Modified:**
- `src/lib/ai/provider.ts` - Main AI provider logic
- `src/lib/config.ts` - Configuration for default provider
- `src/types/index.ts` - Updated AIProvider type
- `__tests__/integration/ai-provider.test.ts` - Updated tests
- `.env.example` - Updated documentation

### 3. ✅ Deployment Configuration

**No Environment Variables Needed:**
- API key is hardcoded in the application
- No need to set any variables in Vercel project settings
- Firebase credentials are already configured with fallbacks

**Optional Environment Variables:**
- `TAVILY_API_KEY` - Only if you want web search integration

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
