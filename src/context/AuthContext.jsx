// src/context/AuthContext.jsx
//
// Shared by both devs, but treat this as backend-owned plumbing.
// Wraps authService in React state so components can just do
// `const { user, loading } = useAuth()`.

import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToAuthChanges, getUserProfile, ensureUserDoc } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userProfile = await ensureUserDoc(fbUser);
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching/creating user profile:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /** Call after any operation that changes the profile doc (e.g. joining a family). */
  const refreshProfile = async () => {
    if (!firebaseUser) return;
    const userProfile = await getUserProfile(firebaseUser.uid);
    setProfile(userProfile);
  };

  const value = {
    user: firebaseUser,
    profile,
    loading,
    isAuthenticated: !!firebaseUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
