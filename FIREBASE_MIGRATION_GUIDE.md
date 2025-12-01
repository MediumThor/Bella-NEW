# Migrating to New Firebase Project (Bella Stone)

## Quick Steps to Switch Firebase Projects

### Step 1: Get Your New Firebase Project Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **Bella Stone** project (not Smart Living)
3. Click the **gear icon (⚙️)** → **Project settings**
4. Scroll down to **"Your apps"** section
5. If you haven't added a web app yet:
   - Click the **web icon (`</>`)** to add a web app
   - Register the app (you can name it "Bella Stone Website")
6. You'll see a config object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

### Step 2: Update Your .env File

Open your `.env` file in the root directory and replace the old Smart Living credentials with your new Bella Stone credentials:

```env
# Bella Stone Firebase Configuration
VITE_FIREBASE_API_KEY=your-new-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-bella-stone-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-bella-stone-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bella-stone-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-new-messaging-sender-id
VITE_FIREBASE_APP_ID=your-new-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-new-measurement-id
```

**Important:** Replace each value with the corresponding value from your new Firebase project config.

### Step 3: Set Up Firestore Database

1. In your new Firebase project, go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode**
4. Choose a location for your database
5. Go to **Rules** tab and paste the security rules from `FIREBASE_SETUP.md`

### Step 4: Enable Authentication

1. Go to **Authentication** → **Get Started**
2. Enable **Email/Password** authentication
3. Create your admin user:
   - Click **Add user**
   - Enter email and password for your admin account
   - Save these credentials securely

### Step 5: Restart Your Development Server

After updating the `.env` file, you **must** restart your dev server:

```bash
# Stop the current server (Ctrl+C or Cmd+C)
# Then restart:
npm run dev
```

### Step 6: Verify It's Working

1. Open your app in the browser
2. Try logging into the admin panel at `/admin/login`
3. Check the browser console (F12) for any Firebase errors
4. If you see connection errors, double-check your `.env` file values

### Troubleshooting

**Still connecting to old project?**
- Make sure you restarted the dev server after updating `.env`
- Check that your `.env` file is in the root directory (same level as `package.json`)
- Verify all environment variable names start with `VITE_`
- Clear your browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

**Authentication errors?**
- Make sure you created an admin user in the new Firebase project
- Verify Email/Password authentication is enabled in the new project

**Database errors?**
- Make sure Firestore is created in the new project
- Verify the security rules are set up correctly
- Check that you're using the correct project ID in your `.env` file

### Next Steps

After switching projects, you'll need to:
- Re-upload any images to the new project's storage
- Re-create any blog posts, page content, etc.
- Set up your collections structure (they should be created automatically when you use the admin panel)

