// src/context/FamilyContext.jsx
//
// Loads the current user's family + member list once `profile.familyId`
// is known, and exposes it app-wide via `useFamily()`.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getFamily, getFamilyMembers } from '../services/familyService';

const FamilyContext = createContext(null);

export const FamilyProvider = ({ children }) => {
  const { profile } = useAuth();
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFamily = useCallback(async () => {
    if (!profile?.familyId) {
      setFamily(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const familyDoc = await getFamily(profile.familyId);
    setFamily(familyDoc);
    setMembers(familyDoc ? await getFamilyMembers(familyDoc.memberIds) : []);
    setLoading(false);
  }, [profile?.familyId]);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  return (
    <FamilyContext.Provider value={{ family, members, loading, refreshFamily: loadFamily }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be used within a FamilyProvider');
  return ctx;
};
