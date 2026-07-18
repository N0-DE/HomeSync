// src/firebase/config.js
//
// Owned by Developer 2 (Backend & Services).
// Single place where the Firebase app is initialized. Every service
// file imports `auth`, `db`, and `messaging` from HERE — nobody else
// should call initializeApp() again.
//
// Fill in your Firebase project credentials in a `.env` file at the
// project root (see `.env.example`). Never commit real keys.

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Messaging only works in supported/secure contexts (HTTPS, browser support).
// We lazily resolve it so the app doesn't crash in unsupported environments
// (e.g. some dev setups, Safari private mode, etc).
export const getMessagingInstance = async () => {
  const supported = await isSupported().catch(() => false);
  return supported ? getMessaging(app) : null;
};
