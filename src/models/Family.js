// src/models/Family.js
//
// Shape of a `families/{familyId}` Firestore document.

/**
 * @typedef {Object} Family
 * @property {string} id
 * @property {string} name
 * @property {string} inviteCode     - short shareable code, e.g. "7QK2LM"
 * @property {string} ownerId        - uid of creator
 * @property {string[]} memberIds
 * @property {number} createdAt
 */

/**
 * @param {Partial<Family>} data
 * @returns {Family}
 */
export const createFamily = (data) => ({
  id: data.id,
  name: data.name ?? 'My Family',
  inviteCode: data.inviteCode,
  ownerId: data.ownerId,
  memberIds: data.memberIds ?? [data.ownerId],
  createdAt: data.createdAt ?? Date.now(),
});

/**
 * Generates a short, human-friendly invite code.
 * Avoids ambiguous characters (0/O, 1/I) for easier manual entry.
 */
export const generateInviteCode = (length = 6) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};
