# Kateno AI - Production-Ready AI Chat Application

A powerful AI chatbot built with Next.js 15, React 19, TypeScript, and Groq AI. Features real-time chat, conversation history, Firebase authentication, and a beautiful UI with Tailwind CSS and shadcn/ui.

## 🚨 Getting Errors? Start Here

If you're seeing these errors in your F12 console:
- ❌ "Missing or insufficient permissions"
- ❌ "502 Failed to load resource" 
- ❌ "Failed to send message"

**→ [Read QUICK_START.md](./QUICK_START.md) (5 minutes to fix everything)**

## ⚡ Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Add your Groq API key to `.env.local`:
```bash
GROQ_API_KEY=gsk_your_key_here
```

**Get a free Groq API key (2 minutes):** https://console.groq.com

### 3. Deploy Firebase Rules

1. Go to: https://console.firebase.google.com/
2. Select project: `fir-config-d3c36`
3. Navigate to Firestore Database → Rules
4. Copy content from `firestore.rules`
5. Paste and click "Publish"

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Test AI

Sign in and ask:
```
Give a code for fibonacci series in python
```

You should get actual Python code! ✅

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Fix all errors in 5 minutes
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete production setup guide
- **[GET_GROQ_KEY.md](./GET_GROQ_KEY.md)** - How to get Groq API key
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deployment checklist

## ✨ Features

- 🤖 **Powerful AI**: Groq with Llama 3.3 70B (GPT-4 level quality)
- 💬 **Real-time Streaming**: Fast response streaming
- 💾 **Conversation History**: Save and resume conversations
- 🔐 **Authentication**: Firebase Auth (Google & Email)
- 🎨 **Beautiful UI**: Tailwind CSS 4 + shadcn/ui components
- 🌓 **Dark Mode**: Theme switching with persistence
- 🎤 **Voice Input**: Speech-to-text support
- 📝 **Markdown Support**: Code highlighting, lists, formatting
- 🔍 **Web Search**: Optional Tavily integration
- 📱 **Responsive**: Works on mobile, tablet, and desktop

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4, shadcn/ui, Radix UI
- **AI**: Groq (Llama 3.3 70B)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Deployment**: Vercel
- **Animation**: Framer Motion
- **Icons**: Lucide React

## 🚀 Deployment to Vercel

### 1. Push to Git

```bash
git add .
git commit -m "Setup Kateno AI"
git push
```

### 2. Deploy to Vercel

1. Go to: https://vercel.com/new
2. Import your Git repository
3. Add environment variable:
   - `GROQ_API_KEY` = `gsk_your_key_here`
4. Click "Deploy"

### 3. Deploy Firebase Rules

Follow the Firebase setup steps in [SETUP_GUIDE.md](./SETUP_GUIDE.md)

### 4. Test Production

Visit your deployed URL and test with:
```
Give a code for fibonacci series in python
```

## 🔑 Environment Variables

### Required

- `GROQ_API_KEY` - Your Groq API key (get from https://console.groq.com)

### Optional

- `TAVILY_API_KEY` - For web search integration

### Firebase (Pre-configured)

Firebase credentials are pre-configured with fallbacks. Only override if using your own Firebase project:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Project Structure

```
src/
├── app/              # Next.js app router
│   ├── api/chat/    # Chat API endpoint
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Main page
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── ChatInterface.tsx
│   ├── Sidebar.tsx
│   └── ...
├── lib/             # Core libraries
│   ├── ai/          # AI provider logic
│   ├── firebase.ts  # Firebase config
│   ├── config.ts    # App configuration
│   └── utils/       # Utility functions
└── types/           # TypeScript types
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💬 Support

If you encounter any issues:

1. Check [QUICK_START.md](./QUICK_START.md) for common solutions
2. Review [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting
3. Open an issue on GitHub

## 🌟 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- AI powered by [Groq](https://groq.com)
- Authentication by [Firebase](https://firebase.google.com)

---

**Made with ❤️ for the AI community**
