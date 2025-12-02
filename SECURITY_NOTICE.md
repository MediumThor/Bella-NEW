# Security Notice - API Key Exposure

## Issue
A Google API key was exposed in the public GitHub repository in the `.env` file.

## Actions Taken
1. ✅ Removed `.env` file from git tracking
2. ✅ Added `.env` to `.gitignore` to prevent future commits
3. ✅ Removed hardcoded Google Maps API key from `index.html`
4. ✅ Updated code to load Google Maps API dynamically using environment variables

## Required Actions

### 1. Regenerate Exposed API Keys
**IMPORTANT:** The API key is still visible in git history. You MUST regenerate it:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find the API key: `AIzaSyDZuljjw-g_wqGQEX1ahOXMnTRLo-uajOU`
4. Click on it and select **Regenerate key**
5. Also check the Google Maps API key: `AIzaSyAGTGwS2I49B3gL2me1XGnhx03k3uBFcmI` and regenerate if needed

### 2. Set Up Environment Variables
Create a `.env` file in the project root (this file is now gitignored):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_new_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=bella-stone.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bella-stone
VITE_FIREBASE_STORAGE_BUCKET=bella-stone.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=933000239126
VITE_FIREBASE_APP_ID=1:933000239126:web:f1e6447d31f534ac7f7d37
VITE_FIREBASE_MEASUREMENT_ID=G-58LNK3MDML

# Google Maps API Key (use the NEW regenerated key)
VITE_GOOGLE_MAPS_API_KEY=your_new_google_maps_api_key_here
```

### 3. Add API Key Restrictions
In Google Cloud Console, add restrictions to your API keys:
- Restrict by HTTP referrer (for Maps API)
- Restrict by IP address if possible
- Limit to only the APIs you need

### 4. For Production (Vercel)
Add these environment variables in your Vercel project settings:
1. Go to your Vercel project
2. Settings > Environment Variables
3. Add all the `VITE_*` variables from your `.env` file

## Note
The exposed keys are still visible in git history. For maximum security, consider:
- Rotating all exposed credentials
- Reviewing Google Cloud Console for any unauthorized usage
- Setting up billing alerts

