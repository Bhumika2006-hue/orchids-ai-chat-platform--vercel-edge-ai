# Kateno AI - Production Setup Guide

## Critical Steps to Get Your AI Working

This guide will help you fix all the errors and get your AI chatbot working in production.

---

## Error 1: Firebase Permissions ("Missing or insufficient permissions")

### Problem
The Firestore security rules haven't been deployed to your Firebase project.

### Solution

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select project: `fir-config-d3c36`

2. **Navigate to Firestore Rules**
   - Click "Firestore Database" in the left sidebar
   - Click the "Rules" tab at the top

3. **Copy and Paste the Rules**
   - Open the `firestore.rules` file in this repository
   - Copy ALL the content
   - Paste it into the Firebase Console Rules editor
   - **Click "Publish"** button

4. **Verify**
   - Wait 30 seconds for rules to propagate
   - Refresh your app
   - Sign in again
   - The "Missing or insufficient permissions" errors should be gone

---

## Error 2: 502 Chat API Error ("Failed to send message")

### Problem
The AI API provider (BlackBox AI) has exceeded its budget quota.

### Solution - Use Groq (Free & Fast)

1. **Get a Free Groq API Key**
   - Go to: https://console.groq.com
   - Sign up for a free account (GitHub, Google, or email)
   - Navigate to "API Keys" section
   - Click "Create API Key"
   - Copy the key (starts with `gsk_...`)

2. **Add API Key to Your Project**

   **For Local Development:**
   - Open `.env.local` file in the project root
   - Find the line: `GROQ_API_KEY=`
   - Add your key: `GROQ_API_KEY=gsk_your_actual_key_here`
   - Save the file
   - Restart your dev server

   **For Vercel Production:**
   - Go to: https://vercel.com/dashboard
   - Select your project (kateno-ai)
   - Go to "Settings" → "Environment Variables"
   - Click "Add New"
   - Name: `GROQ_API_KEY`
   - Value: `gsk_your_actual_key_here`
   - Click "Save"
   - **Redeploy your app** (go to Deployments → click "..." → "Redeploy")

3. **Why Groq?**
   - ✅ **Free tier**: 30 requests per minute
   - ✅ **Fast**: One of the fastest inference providers
   - ✅ **Powerful model**: Llama 3.3 70B (similar quality to GPT-4)
   - ✅ **No credit card required**
   - ✅ **Production ready**

---

## Testing the AI

After completing both steps above, test your AI with this exact prompt:

```
Give a code for fibonacci series in python
```

**Expected Response:**
The AI should provide actual Python code for Fibonacci series, such as:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Or iterative version
def fibonacci_iterative(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

---

## Verification Checklist

After setup, verify everything works:

- [ ] No "Missing or insufficient permissions" errors in F12 console
- [ ] No 502 errors when sending chat messages
- [ ] AI responds with actual code/answers (not mock responses)
- [ ] Chat history saves and loads correctly
- [ ] Settings (theme, context memory) persist across refreshes
- [ ] New conversations can be created and deleted

---

## Common Issues

### "GROQ_API_KEY environment variable is not set"
- Make sure you added the API key to `.env.local` for local dev
- For production, add it to Vercel environment variables and redeploy

### "Invalid API Key" from Groq
- Double-check you copied the complete API key
- Make sure there are no extra spaces before or after the key
- Verify the key starts with `gsk_`

### Still getting Firebase permissions errors
- Make sure you clicked "Publish" in Firebase Console after pasting rules
- Wait 30-60 seconds for rules to propagate
- Clear browser cache and cookies
- Sign out and sign in again

### App works locally but not on Vercel
- Verify you added GROQ_API_KEY to Vercel environment variables
- Make sure you redeployed after adding the environment variable
- Check Vercel deployment logs for errors

---

## Support

If you still encounter issues:

1. Check browser console (F12) for detailed error messages
2. Check Vercel deployment logs (if deployed)
3. Verify all environment variables are set correctly
4. Make sure Firebase rules are published

---

## Production Deployment

Once setup is complete:

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Setup Groq API and Firebase rules"
   git push
   ```

2. **Vercel will auto-deploy**
   - Make sure GROQ_API_KEY is set in Vercel
   - Deployment should succeed
   - Test the live app

3. **Monitor Usage**
   - Groq free tier: 30 requests/min
   - For higher usage, upgrade to Groq paid plan
   - Monitor at: https://console.groq.com

---

## Architecture Overview

**AI Provider:** Groq (llama-3.3-70b-versatile)
**Database:** Firebase Firestore
**Authentication:** Firebase Auth
**Deployment:** Vercel
**Frontend:** Next.js 15 + React 19 + TypeScript
**Styling:** Tailwind CSS 4 + shadcn/ui

---

**Your AI chatbot should now be fully functional in production!** 🚀
