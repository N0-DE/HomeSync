// src/firebase/collections.js
//
// Central registry of Firestore collection names. Import these instead
// of typing raw strings so a rename is a one-line change, not a
// find-and-replace across the codebase.

export const COLLECTIONS = {
  USERS: 'users',
  FAMILIES: 'families',
  SHOPPING_ITEMS: 'shoppingItems',
  ACTIVITIES: 'activities',
  NOTIFICATIONS: 'notifications',
};
