# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Get Started**
2. Enable **Email/Password** authentication
3. (Optional) Enable **Google** sign-in provider

## Step 3: Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Start in **production mode** (we'll set up security rules)
3. Choose a location for your database

## Step 4: Set Up Security Rules

Go to **Firestore Database** > **Rules** and paste the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Blog posts - public read for published, admin write
    match /blogPosts/{postId} {
      allow read: if resource.data.published == true || request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Images - public read, admin write
    match /images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Slideshow images for Charters page - public read, admin write
    match /slideshowImages/{imageId} {
      allow read: if true;                 // Charters page can load them publicly
      allow write: if request.auth != null; // Only signed-in admin via ImageLibrary
    }
    
    // Page content - public read, admin write
    match /pageContent/{pageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Headshots - public read (About page), admin write (ImageLibrary)
    match /headshots/{docId} {
      allow read: if true;               // About page can load the headshot without auth
      allow write: if request.auth != null; // Only logged-in admin can save/update/remove
    }
    
    // Charter inquiries - public create, admin read/write
    match /charterInquiries/{inquiryId} {
      allow create: if true;
      allow read, write: if request.auth != null;
    }
    
    match /contactMessages/{msgId} {
      allow create: if true;            // public can submit
      allow read, write: if request.auth != null; // only admin can view/manage
    }

    // Lesson inquiries - public create, admin read/write
    match /lessonInquiries/{inquiryId} {
      allow create: if true;
      allow read, write: if request.auth != null;
    }

    // Home page slideshow images
    match /homeSlideshowImages/{docId} {
      // Public read so the home page gallery works
      allow read: if true;

      // Only authenticated users (admin) can create/update/delete via the dashboard
      allow write: if request.auth != null;
    }
    
    // Inventory page image - public read, admin write
    match /inventoryImage/{docId} {
      allow read: if true; // Public read so the inventory page works
      allow write: if request.auth != null; // Only admin can upload/delete
    }
    
    // Process step images - public read, admin write
    match /processImages/{imageId} {
      allow read: if true; // Public read so the process page works
      allow write: if request.auth != null; // Only admin can upload/delete
    }
    
    // Homepage image - public read, admin write
    match /homepageImage/{docId} {
      allow read: if true; // Public read so the homepage works
      allow write: if request.auth != null; // Only admin can upload/delete
    }
    
    // Job requests - public create (for job checklist form), admin read/write
    match /jobRequests/{requestId} {
      allow create: if true; // Public can submit job checklist
      allow read, write: if request.auth != null; // Only admin can view/manage
    }
    
    // Measurement requests - public create (for measurement checklist form), admin read/write
    match /measurementRequests/{requestId} {
      allow create: if true; // Public can submit measurement checklist
      allow read, write: if request.auth != null; // Only admin can view/manage
    }
    
    // Horus equipment image - public read, admin write
    match /horusImage/{docId} {
      allow read: if true; // Public read so the process page works
      allow write: if request.auth != null; // Only admin can upload/delete
    }
    
    // Sasso equipment image - public read, admin write
    match /sassoImage/{docId} {
      allow read: if true; // Public read so the process page works
      allow write: if request.auth != null; // Only admin can upload/delete
    }
    
    // Charter registrations - public read/write for guestData, admin full access
    match /charterRegistrations/{registrationId} {
      allow read: if true; // Anyone can read (needed for customer form)
      allow create: if request.auth != null; // Only admin can create
      allow update: if request.auth != null || 
                     (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['guestData', 'status', 'updatedAt'])); // Customer can only update guestData
      allow delete: if request.auth != null;
    }
  }
}
```

**Note:** Firestore uses a rules language (not JSON). The format above is the correct syntax for Firestore security rules. If you're using Realtime Database instead, that uses JSON format, but this project uses Firestore.

## Step 4a: Enable Firebase Storage

1. Go to **Storage** > **Get Started**
2. Start in **production mode** (we'll set up security rules)
3. Choose a location for your storage bucket (should match your Firestore location)

## Step 4b: Set Up Firebase Storage CORS Configuration

Firebase Storage requires CORS to be configured for file uploads from web browsers. You need to set this up using `gsutil` (Google Cloud Storage utility).

### Option 1: Using gsutil (Recommended)

1. Install Google Cloud SDK if you haven't already:
   ```bash
   # On macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   ```

3. Set your project:
   ```bash
   gcloud config set project bella-stone
   ```

4. Create a CORS configuration file named `cors.json`:
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization", "x-goog-upload-protocol", "x-goog-upload-command"]
     }
   ]
   ```

5. Apply the CORS configuration:
   ```bash
   gsutil cors set cors.json gs://bella-stone.firebasestorage.app
   ```

### Option 2: Using Firebase Console (Alternative)

If you can't use gsutil, you can also configure CORS through the Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `bella-stone`
3. Navigate to **Cloud Storage** > **Buckets**
4. Click on your storage bucket: `bella-stone.firebasestorage.app`
5. Go to the **Configuration** tab
6. Scroll to **CORS configuration**
7. Click **Edit** and paste:
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization", "x-goog-upload-protocol", "x-goog-upload-command"]
     }
   ]
   ```
8. Click **Save**

## Step 4c: Set Up Firebase Storage Security Rules

Go to **Storage** > **Rules** and paste the following rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Quote request images - public write for submissions, admin read
    match /quote-requests/{allPaths=**} {
      allow write: if true; // Anyone can upload quote request images
      allow read: if request.auth != null; // Only admin can view
    }
    
    // Job checklist drawings - public write for submissions, admin read
    match /job-drawings/{allPaths=**} {
      allow write: if true; // Anyone can upload job drawings
      allow read: if request.auth != null; // Only admin can view
    }
    
    // Admin uploaded images - admin only
    match /images/{allPaths=**} {
      allow read: if true; // Public read
      allow write: if request.auth != null; // Only admin can upload
    }
    
    match /home-slideshow/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /homepage/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /process-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /inventory/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /equipment/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 5: Get Configuration

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Copy the configuration values

## Step 6: Set Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 7: Create Admin User

1. Go to **Authentication** > **Users**
2. Click "Add user"
3. Enter email and password for your admin account
4. Save the credentials securely

## Step 8: Install Dependencies

```bash
npm install
```

## Security Features

- ✅ Email/Password authentication
- ✅ Google Sign-in (optional)
- ✅ Protected admin routes
- ✅ Firestore security rules
- ✅ Input validation
- ✅ Only published posts visible to public

## Collections Structure

- `blogPosts` - Blog posts (title, content, excerpt, published, etc.)
- `images` - Image library (url, name, uploadedAt, etc.)
- `pageContent` - Page text content (heroTitle, section1Title, etc.)
- `charterInquiries` - Public charter inquiries from customers
- `charterRegistrations` - Charter registration forms (lockedFields, guestData, status)
- `contactMessages` - General contact form submissions
- `lessonInquiries` - Lesson inquiry form submissions
- `slideshowImages` - Images for Charters page slideshow
- `homeSlideshowImages` - Images for Home page slideshow
- `headshots` - Headshot images for About Me page
- `inventoryImage` - Image for Inventory page
- `processImages` - Images for Our Process page timeline steps
- `homepageImage` - Single hero image for the homepage
- `horusImage` - Image for Horus Slab Scanner equipment
- `sassoImage` - Image for Sasso K-600 Miter Saw equipment
- `measurementRequests` - Measurement checklist form submissions from cabinet makers/GCs

## Access Admin Panel

1. Navigate to `/admin/login`
2. Sign in with your admin credentials
3. Access the dashboard with tabs for:
   - Blog Posts management
   - Image Library
   - Page Content editing
   - Charter Management (inquiries and registration forms)

