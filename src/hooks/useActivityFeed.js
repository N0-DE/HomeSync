// src/hooks/useActivityFeed.js

import { useEffect, useState } from 'react';
import { subscribeToActivityFeed } from '../services/activityService';

export const useActivityFeed = (familyId) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!familyId) {
      setActivities([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToActivityFeed(
      familyId,
      (data) => {
        setActivities(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [familyId]);

  return { activities, loading, error };
};
