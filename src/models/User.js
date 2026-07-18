// src/models/User.js
//
// This file documents the shape of a `users/{uid}` Firestore document.
// JS has no static types, so we use a factory + JSDoc typedef as the
// contract both devs code against. Import `createUser` when writing
// new user docs so every doc has the same shape.

/**
 * @typedef {Object} User
 * @property {string} uid
 * @property {string} name
 * @property {string} email
 * @property {string|null} photoURL
 * @property {string|null} familyId   - null until they create/join a family
 * @property {number} createdAt       - ms epoch
 */

/**
 * @param {Partial<User>} data
 * @returns {User}
 */
export const createUser = (data) => ({
  uid: data.uid,
  name: data.name ?? 'Unnamed',
  email: data.email ?? '',
  photoURL: data.photoURL ?? null,
  familyId: data.familyId ?? null,
  createdAt: data.createdAt ?? Date.now(),
});
