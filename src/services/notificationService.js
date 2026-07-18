// src/services/notificationService.js
//
// Owned by Developer 2. Handles browser notification permission, FCM
// token registration, and building the "you're near a store" reminder
// message. UI just calls `requestNotificationAccess()` once and then
// `maybeNotifyNearbyStore(...)` from the geofencing loop.

import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getMessagingInstance, db } from '../firebase/config';
import { getToken, onMessage } from 'firebase/messaging';
import { COLLECTIONS } from '../firebase/collections';
import { NOTIFICATION_COOLDOWN_MS } from '../utils/constants';

// In-memory cooldown tracker: storeId -> last-notified timestamp.
// Prevents spamming the user every few seconds while they're parked
// near the same supermarket.
const lastNotifiedAt = new Map();

/** Asks the browser for notification permission. Returns true/false. */
export const requestNotificationAccess = async () => {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Registers the device for push notifications and stores the FCM token
 * against the user's profile so a Cloud Function could target them later.
 */
export const registerPushToken = async (userId) => {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
    if (token) {
      await setDoc(doc(db, COLLECTIONS.USERS, userId), { fcmToken: token }, { merge: true });
    }
    return token;
  } catch {
    // Push isn't essential to the demo — fail silently and fall back
    // to in-app/local notifications.
    return null;
  }
};

/** Listens for foreground FCM messages (app open in a tab). */
export const onForegroundMessage = async (callback) => {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
};

/** Shows a local browser notification (works even without FCM/Cloud Functions). */
const showLocalNotification = (title, body) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/icon-192.png' });
};

/**
 * Core "smart reminder" logic: given a store the user is near and the
 * family's pending shopping items, fires a notification like
 * "You're near Reliance Smart. Milk and Bread are pending."
 * Respects a per-store cooldown so it doesn't repeat constantly.
 */
export const maybeNotifyNearbyStore = ({ store, pendingItems, familyId }) => {
  if (pendingItems.length === 0) return;

  const last = lastNotifiedAt.get(store.id) ?? 0;
  if (Date.now() - last < NOTIFICATION_COOLDOWN_MS) return;
  lastNotifiedAt.set(store.id, Date.now());

  const itemNames = pendingItems.slice(0, 3).map((i) => i.name).join(', ');
  const suffix = pendingItems.length > 3 ? ` and ${pendingItems.length - 3} more` : '';
  const body = `You're near ${store.name}. ${itemNames}${suffix} pending.`;

  showLocalNotification('HomeSync reminder', body);

  // Log it so it also shows up as an in-app notification / activity trail.
  addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    familyId,
    storeName: store.name,
    itemNames: pendingItems.map((i) => i.name),
    message: body,
    timestamp: serverTimestamp(),
  }).catch(() => {});
};
