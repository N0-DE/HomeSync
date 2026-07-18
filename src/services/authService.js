// src/services/authService.js
//
// Owned by Developer 2. ALL Firebase Auth calls live here.
// UI components (Developer 1) must never import `firebase/auth` directly —
// they call these functions instead. This keeps Firebase swappable and
// keeps auth bugs in one file.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { createUser } from '../models/User';

/** Registers a listener for auth state changes. Returns an unsubscribe fn. */
export const subscribeToAuthChanges = (callback) => onAuthStateChanged(auth, callback);

/** Creates a Firestore user doc if one doesn't already exist. */
export const ensureUserDoc = async (firebaseUser, extra = {}) => {
  const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
  const existing = await getDoc(userRef);
  if (!existing.exists()) {
    const newUser = createUser({
      uid: firebaseUser.uid,
      name: firebaseUser.displayName ?? extra.name ?? 'Unnamed',
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
    });
    await setDoc(userRef, { ...newUser, createdAt: serverTimestamp() });
    return newUser;
  }
  return existing.data();
};

/** Email/password sign up. Returns the created app-level User object. */
export const signUpWithEmail = async ({ name, email, password }) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    return await ensureUserDoc(user, { name });
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
};

/** Email/password login. */
export const signInWithEmail = async ({ email, password }) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return await ensureUserDoc(user);
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
};

/** Google popup login. */
export const signInWithGoogle = async () => {
  try {
    const { user } = await signInWithPopup(auth, googleProvider);
    return await ensureUserDoc(user);
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
};

export const logOut = () => signOut(auth);

/** Fetches the current user's Firestore profile doc. */
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? snap.data() : null;
};

/** Turns raw Firebase error codes into friendly messages for the UI. */
const mapAuthError = (error) => {
  const code = error.code ?? '';
  const map = {
    'auth/email-already-in-use': 'That email is already registered. Try logging in.',
    'auth/invalid-email': 'That email address looks invalid.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  };
  return map[code] ?? `Something went wrong: ${error.message}`;
};
