// src/models/ShoppingItem.js
//
// Shape of a `shoppingItems/{itemId}` Firestore document.

export const ITEM_STATUS = {
  PENDING: 'pending',
  BOUGHT: 'bought',
};

export const ITEM_CATEGORIES = [
  'Dairy',
  'Bakery',
  'Produce',
  'Meat & Seafood',
  'Pantry',
  'Frozen',
  'Household',
  'Personal Care',
  'Beverages',
  'Other',
];

/**
 * @typedef {Object} ShoppingItem
 * @property {string} id
 * @property {string} familyId
 * @property {string} name
 * @property {string} category
 * @property {number} quantity
 * @property {string} addedBy       - uid
 * @property {string} addedByName   - denormalized for fast list rendering
 * @property {number} timestamp
 * @property {'pending'|'bought'} status
 * @property {string|null} boughtBy
 * @property {number|null} boughtAt
 */

/**
 * @param {Partial<ShoppingItem>} data
 * @returns {ShoppingItem}
 */
export const createShoppingItem = (data) => ({
  id: data.id,
  familyId: data.familyId,
  name: data.name,
  category: data.category ?? 'Other',
  quantity: data.quantity ?? 1,
  addedBy: data.addedBy,
  addedByName: data.addedByName ?? 'Someone',
  timestamp: data.timestamp ?? Date.now(),
  status: data.status ?? ITEM_STATUS.PENDING,
  boughtBy: data.boughtBy ?? null,
  boughtAt: data.boughtAt ?? null,
});
