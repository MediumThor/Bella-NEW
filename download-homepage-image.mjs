// Script to download homepage image from Firebase and save to public folder
// Run with: node download-homepage-image.mjs
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error('❌ Error: Firebase environment variables not found!');
  console.error('Make sure you have a .env file with VITE_FIREBASE_* variables');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        return downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        return reject(new Error(`Failed to download image: ${response.statusCode} ${response.statusMessage}`));
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Image downloaded successfully: ${filepath}`);
        resolve(filepath);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

// Main function
async function main() {
  try {
    console.log('🔍 Fetching homepage image URL from Firebase...');
    
    const homepageRef = collection(db, 'homepageImage');
    const snapshot = await getDocs(homepageRef);
    
    if (snapshot.empty) {
      console.log('❌ No homepage image found in Firebase');
      process.exit(1);
    }
    
    const data = snapshot.docs[0].data();
    if (!data.url) {
      console.log('❌ Homepage image data missing URL');
      process.exit(1);
    }
    
    console.log(`📥 Found image URL: ${data.url}`);
    
    // Determine file extension from URL
    const urlPath = new URL(data.url).pathname;
    let extension = path.extname(urlPath);
    if (!extension || extension === '') {
      // Try to get extension from content type or default to jpg
      extension = '.jpg';
    }
    
    // Save to public folder as homepage-hero with appropriate extension
    const filename = `homepage-hero${extension}`;
    const publicPath = path.join(__dirname, 'public', filename);
    
    console.log(`💾 Downloading to: ${publicPath}`);
    await downloadImage(data.url, publicPath);
    
    console.log(`\n✨ Success! Image saved to: public/${filename}`);
    console.log(`\n📝 The code has been updated to use: '/${filename}'`);
    console.log(`   (or '/homepage-hero.jpg' if extension detection failed)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

