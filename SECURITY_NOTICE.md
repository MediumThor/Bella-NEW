# Security Notice - Firebase API Key Exposure

## Issue
The Firebase API key was exposed in the public GitHub repository in the `.env` file that was committed to git.

**Exposed Key:** `AIzaSyDZuljjw-g_wqGQEX1ahOXMnTRLo-uajOU`  
**Project:** Bella Stone (id: bella-stone)

## Actions Taken
1. ✅ Removed `.env` file from git tracking
2. ✅ Added `.env` to `.gitignore` to prevent future commits
3. ✅ Firebase configuration already uses environment variables (secure)

## Required Actions

### 1. Regenerate Firebase API Key (CRITICAL)
**IMPORTANT:** The API key is still visible in git history. You MUST regenerate it:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **Bella Stone**
3. Go to **Project Settings** (gear icon) > **General** tab
4. Scroll down to **Your apps** section
5. Find your web app and click on it
6. You'll see the Firebase config - the `apiKey` is what needs to be regenerated
7. To regenerate:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** > **Credentials**
   - Find the API key: `AIzaSyDZuljjw-g_wqGQEX1ahOXMnTRLo-uajOU`
   - Click on it and select **Regenerate key**
   - Copy the new API key

### 2. Set Up Environment Variables Locally
Create a `.env` file in the project root (this file is now gitignored):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_new_regenerated_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=bella-stone.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bella-stone
VITE_FIREBASE_STORAGE_BUCKET=bella-stone.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=933000239126
VITE_FIREBASE_APP_ID=1:933000239126:web:f1e6447d31f534ac7f7d37
VITE_FIREBASE_MEASUREMENT_ID=G-58LNK3MDML
```

### 3. Add API Key Restrictions
In Google Cloud Console, add restrictions to your Firebase API key:
- Go to **APIs & Services** > **Credentials**
- Click on your Firebase API key
- Under **API restrictions**, restrict to only Firebase services:
  - Firebase Authentication API
  - Cloud Firestore API
  - Firebase Storage API
  - Firebase Realtime Database API (if used)
- Under **Application restrictions**, add HTTP referrer restrictions for your domains

### 4. For Production (Vercel)
Add these environment variables in your Vercel project settings:
1. Go to your Vercel project dashboard
2. Settings > **Environment Variables**
3. Add all the `VITE_*` variables from your `.env` file
4. Make sure to add them for **Production**, **Preview**, and **Development** environments

### 5. Review for Unauthorized Usage
1. Check Firebase Console for any unusual activity
2. Review Google Cloud Console billing for unexpected charges
3. Set up billing alerts in Google Cloud Console
4. Monitor Firebase usage in the Firebase Console

## Note
The exposed key is still visible in git history. After regenerating:
- The old key will be invalid
- Update your `.env` file with the new key
- Update Vercel environment variables with the new key
- Test that your app still works with the new key

