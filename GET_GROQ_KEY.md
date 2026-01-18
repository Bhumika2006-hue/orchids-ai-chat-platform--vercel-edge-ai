# How to Get Your Groq API Key (2 Minutes)

## Step-by-Step Guide

### 1. Visit Groq Console
Go to: **https://console.groq.com**

### 2. Sign Up (30 seconds)
- Click "Sign Up" or "Get Started"
- Choose sign-in method:
  - **GitHub** (recommended - 1 click)
  - **Google** (recommended - 1 click)
  - Email (requires verification)

### 3. Create API Key (30 seconds)
After signing in:
1. You'll see the dashboard
2. Look for "API Keys" in the left sidebar
3. Click "Create API Key"
4. Give it a name (e.g., "Kateno AI")
5. Click "Create"
6. **Copy the key** (starts with `gsk_...`)

### 4. Add to Your Project (30 seconds)

**Option A: Local Development**
```bash
# Open .env.local and add:
GROQ_API_KEY=gsk_your_actual_key_here
```

**Option B: Vercel Production**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add: `GROQ_API_KEY` = `gsk_your_actual_key_here`
5. Redeploy

### 5. Test (30 seconds)
```bash
npm run dev
```

Visit http://localhost:3000, sign in, and ask:
```
Give a code for fibonacci series in python
```

You should get actual code! ✅

---

## Groq Free Tier Features

- ✅ **30 requests per minute** (very generous)
- ✅ **No credit card required**
- ✅ **Llama 3.3 70B model** (GPT-4 level quality)
- ✅ **Fast inference** (<1 second response time)
- ✅ **Production ready**
- ✅ **No time limit on free tier**

## Upgrade Options (Optional)

If you need more than 30 requests/minute:
- **Pay as you go**: $0.59 per million tokens
- **Much cheaper than OpenAI**
- No monthly commitment

---

## Why Groq?

1. **Fastest inference** - Groq has custom AI chips
2. **Free tier that actually works** - Unlike many providers
3. **Production grade** - Used by many companies
4. **No surprises** - Clear pricing, no hidden costs

---

**Total Time: ~2 minutes to get your AI working!** 🚀
