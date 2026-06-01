import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for Bella Stone project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug: Check if environment variables are loaded (remove in production)
if (import.meta.env.DEV) {
  console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
    authDomain: firebaseConfig.authDomain || 'MISSING',
    projectId: firebaseConfig.projectId || 'MISSING',
  });
  
  if (!firebaseConfig.apiKey) {
    console.error('❌ VITE_FIREBASE_API_KEY is missing! Make sure .env file exists and dev server was restarted.');
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Defer Analytics so it does not block first paint
export const initFirebaseAnalytics = () => {
  if (typeof window === 'undefined' || !firebaseConfig.measurementId) return;

  const schedule =
    'requestIdleCallback' in window
      ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 4000 })
      : (cb: () => void) => window.setTimeout(cb, 2000);

  schedule(() => {
    void import('firebase/analytics').then(({ getAnalytics }) => {
      getAnalytics(app);
    });
  });
};

export default app;

