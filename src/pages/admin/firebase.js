import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyMockKeyForDevEnvironment12345",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "church-app-mock.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "church-app-mock",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "church-app-mock.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

let app;
let storage = null;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  storage = getStorage(app);
} catch (err) {
  console.warn('[Firebase] Initialization note:', err);
}

export { storage };

