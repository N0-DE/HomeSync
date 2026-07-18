// src/services/activityService.js
//
// Owned by Developer 2. Append-only activity log. Other services
// (shoppingService, familyService) call `logActivity` internally —
// the UI only ever reads via `subscribeToActivityFeed`.

import { collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { createActivity } from '../models/Activity';

/** Writes a new activity entry. Fire-and-forget from callers' perspective. */
export const logActivity = async ({ familyId, type, actorId, actorName, message }) => {
  const activity = createActivity({ familyId, type, actorId, actorName, message });
  delete activity.id; // Firestore addDoc auto-generates the ID, and crashes on undefined values
  await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
    ...activity,
    timestamp: serverTimestamp(),
  });
};

/**
 * Subscribes to the most recent activity entries for a family.
 * @param {string} familyId
 * @param {(activities: import('../models/Activity').Activity[]) => void} onUpdate
 * @param {(error: Error) => void} [onError]
 * @param {number} [max] - how many recent entries to load
 * @returns {() => void} unsubscribe function
 */
export const subscribeToActivityFeed = (familyId, onUpdate, onError, max = 50) => {
  const q = query(
    collection(db, COLLECTIONS.ACTIVITIES),
    where('familyId', '==', familyId),
    orderBy('timestamp', 'desc'),
    limit(max)
  );
  return onSnapshot(
    q,
    (snap) => onUpdate(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
    (error) => onError?.(error)
  );
};
