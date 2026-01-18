# Firestore Security Rules Setup

## Important: Fix Firebase Permissions Errors

To fix the "Missing or insufficient permissions" errors you're seeing in the console, you need to update your Firestore security rules in the Firebase Console.

### Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `fir-config-d3c36`
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the content from `firestore.rules` file in this repository

### What the rules do:

- Allow authenticated users to read and write their own conversations
- Allow authenticated users to read and write their own settings
- Deny all other access by default

### After updating:

1. Click **Publish** in the Firebase Console
2. Wait a few seconds for the rules to propagate
3. Refresh your app at https://kateno-ai.vercel.app/
4. The permission errors should be gone!

### Testing:

After updating the rules, sign in to your app and check the browser console (F12). The errors should no longer appear.
