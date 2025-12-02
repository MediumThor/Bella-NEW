# Quick Guide: Regenerate Firebase API Key

## Step-by-Step Instructions

### Method 1: Google Cloud Console (Fastest)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Make sure you're logged in with the account that owns the Firebase project

2. **Select Your Project**
   - Click the project dropdown at the top
   - Select **"Bella Stone"** (project ID: `bella-stone`)

3. **Navigate to Credentials**
   - In the left sidebar, click **"APIs & Services"**
   - Click **"Credentials"**

4. **Find Your API Key**
   - Look for the API key: `AIzaSyDZuljjw-g_wqGQEX1ahOXMnTRLo-uajOU`
   - Or look for "Browser key" or "API key" under "API keys" section
   - Click on the key name to open it

5. **Regenerate the Key**
   - Click the **"Regenerate key"** button (or "RESTRICT KEY" → "REGENERATE KEY")
   - Confirm the regeneration
   - **IMPORTANT:** Copy the new key immediately - you won't see it again!

6. **Add Restrictions (Recommended)**
   - Under "API restrictions", select "Restrict key"
   - Choose only Firebase services:
     - ✅ Firebase Authentication API
     - ✅ Cloud Firestore API
     - ✅ Firebase Storage API
   - Under "Application restrictions", you can add HTTP referrer restrictions for your domains

### Method 2: Via Firebase Console

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select **"Bella Stone"** project

2. **Open Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Click **"Project settings"**

3. **View Your App Config**
   - Scroll down to **"Your apps"** section
   - Click on your web app
   - You'll see the Firebase config with the API key

4. **Go to Google Cloud Console**
   - Click the link "Manage API keys in Google Cloud Console"
   - This takes you directly to the credentials page
   - Follow steps 4-6 from Method 1 above

## After Regenerating

### 1. Update Local `.env` File
Create or update `.env` in your project root:
```env
VITE_FIREBASE_API_KEY=your_new_key_here
VITE_FIREBASE_AUTH_DOMAIN=bella-stone.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bella-stone
VITE_FIREBASE_STORAGE_BUCKET=bella-stone.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=933000239126
VITE_FIREBASE_APP_ID=1:933000239126:web:f1e6447d31f534ac7f7d37
VITE_FIREBASE_MEASUREMENT_ID=G-58LNK3MDML
```

### 2. Update Vercel Environment Variables
1. Go to: https://vercel.com/dashboard
2. Select your **Bella Stone** project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_FIREBASE_API_KEY`
5. Click **Edit** and paste the new key
6. Save and redeploy if needed

### 3. Test Your App
- Restart your local dev server
- Test Firebase features (auth, database, storage)
- Verify everything works with the new key

## Security Best Practices

After regenerating, add these restrictions:

1. **API Restrictions**
   - Only enable Firebase APIs you actually use
   - Don't enable all APIs "just in case"

2. **Application Restrictions**
   - Add HTTP referrer restrictions:
     - `https://yourdomain.com/*`
     - `https://*.vercel.app/*` (for preview deployments)
     - `http://localhost:*` (for local development)

3. **Monitor Usage**
   - Set up billing alerts in Google Cloud Console
   - Monitor API usage regularly
   - Check for unexpected spikes

## Troubleshooting

**"I can't find the API key"**
- Make sure you're in the correct Google Cloud project
- Check that you have "Owner" or "Editor" permissions
- Try searching for "API key" in the credentials page

**"The app stopped working after regenerating"**
- Make sure you updated both `.env` and Vercel
- Restart your dev server
- Clear browser cache
- Check browser console for errors

**"I lost the new key"**
- You'll need to regenerate again
- The old key is already invalid, so it's safe to regenerate

