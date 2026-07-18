// src/hooks/useShoppingList.js
//
// Thin hook wrapping shoppingService's realtime subscription so pages
// stay declarative: `const { items, loading, error } = useShoppingList(familyId)`.

import { useEffect, useState } from 'react';
import { subscribeToShoppingList } from '../services/shoppingService';

export const useShoppingList = (familyId) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!familyId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToShoppingList(
      familyId,
      (data) => {
        setItems(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [familyId]);

  return { items, loading, error };
};
