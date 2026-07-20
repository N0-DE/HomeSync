// src/services/shoppingService.js
//
// Owned by Developer 2. All Firestore reads/writes for the shopping list.
// Developer 1's UI calls these functions and never touches Firestore
// directly — e.g. `await shoppingService.addItem(item)`.

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { createShoppingItem, ITEM_STATUS } from '../models/ShoppingItem';
import { logActivity } from './activityService';
import { ACTIVITY_TYPES, buildActivityMessage } from '../models/Activity';

/**
 * Subscribes to a family's live shopping list, ordered newest-first.
 * @param {string} familyId
 * @param {(items: import('../models/ShoppingItem').ShoppingItem[]) => void} onUpdate
 * @param {(error: Error) => void} [onError]
 * @returns {() => void} unsubscribe function
 */
export const subscribeToShoppingList = (familyId, onUpdate, onError) => {
  const q = query(
    collection(db, COLLECTIONS.SHOPPING_ITEMS),
    where('familyId', '==', familyId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      items.sort((a, b) => (b.timestamp?.toMillis?.() || b.timestamp || 0) - (a.timestamp?.toMillis?.() || a.timestamp || 0));
      onUpdate(items);
    },
    (error) => onError?.(error)
  );
};

/** Adds a single item to the family shopping list and logs an activity entry. */
export const addItem = async ({ familyId, name, category, quantity, addedBy, addedByName }) => {
  const item = createShoppingItem({ familyId, name, category, quantity, addedBy, addedByName });
  delete item.id; // Fix Firestore undefined ID error
  const docRef = await addDoc(collection(db, COLLECTIONS.SHOPPING_ITEMS), {
    ...item,
    timestamp: serverTimestamp(),
  });

  await logActivity({
    familyId,
    type: ACTIVITY_TYPES.ITEM_ADDED,
    actorId: addedBy,
    actorName: addedByName,
    message: buildActivityMessage(ACTIVITY_TYPES.ITEM_ADDED, { actorName: addedByName, itemName: name }),
  });

  return { ...item, id: docRef.id };
};

/**
 * Adds multiple items at once (used by AI Quick Add).
 * Runs sequentially to keep activity log ordering sane; fine for
 * hackathon-scale batches (a handful of items).
 */
export const addItems = async (items, { addedBy, addedByName, familyId }) => {
  const created = [];
  for (const item of items) {
    created.push(
      await addItem({ familyId, addedBy, addedByName, name: item.name, category: item.category, quantity: item.quantity ?? 1 })
    );
  }
  return created;
};

/** Marks an item as bought (or back to pending) and logs the change. */
export const toggleItemStatus = async ({ itemId, currentStatus, itemName, familyId, userId, userName }) => {
  const nextStatus = currentStatus === ITEM_STATUS.PENDING ? ITEM_STATUS.BOUGHT : ITEM_STATUS.PENDING;
  await updateDoc(doc(db, COLLECTIONS.SHOPPING_ITEMS, itemId), {
    status: nextStatus,
    boughtBy: nextStatus === ITEM_STATUS.BOUGHT ? userId : null,
    boughtAt: nextStatus === ITEM_STATUS.BOUGHT ? serverTimestamp() : null,
  });

  if (nextStatus === ITEM_STATUS.BOUGHT) {
    await logActivity({
      familyId,
      type: ACTIVITY_TYPES.ITEM_BOUGHT,
      actorId: userId,
      actorName: userName,
      message: buildActivityMessage(ACTIVITY_TYPES.ITEM_BOUGHT, { actorName: userName, itemName }),
    });
  }
};

export const deleteItem = (itemId) => deleteDoc(doc(db, COLLECTIONS.SHOPPING_ITEMS, itemId));

export const updateItem = (itemId, changes) =>
  updateDoc(doc(db, COLLECTIONS.SHOPPING_ITEMS, itemId), changes);

/** Returns just the pending items from a list — handy for map/notification logic. */
export const getPendingItems = (items) => items.filter((i) => i.status === ITEM_STATUS.PENDING);
