// src/hooks/useGeofencing.js
//
// Combines mapService (location watching + nearby store lookup) with
// notificationService (the actual reminder) into one hook the Map page
// can turn on/off. Kept separate from mapService itself so map UI
// concerns (rendering markers) don't get tangled with notification logic.

import { useEffect, useRef, useState } from 'react';
import { watchPosition, checkGeofenceHits } from '../services/mapService';
import { maybeNotifyNearbyStore } from '../services/notificationService';
import { getPendingItems } from '../services/shoppingService';

/**
 * @param {boolean} enabled
 * @param {Array} stores - nearby stores already discovered via Places API
 * @param {Array} shoppingItems - current family shopping list
 * @param {string} familyId
 */
export const useGeofencing = ({ enabled, stores, shoppingItems, familyId }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHits, setNearbyHits] = useState([]);
  const stopWatchingRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      stopWatchingRef.current?.();
      return;
    }

    stopWatchingRef.current = watchPosition((location) => {
      setUserLocation(location);
      const hits = checkGeofenceHits(location, stores);
      setNearbyHits(hits);

      const pending = getPendingItems(shoppingItems);
      hits.forEach((store) => maybeNotifyNearbyStore({ store, pendingItems: pending, familyId }));
    });

    return () => stopWatchingRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, stores, shoppingItems, familyId]);

  return { userLocation, nearbyHits };
};
