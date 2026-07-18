// src/models/Activity.js
//
// Shape of an `activities/{activityId}` Firestore document.
// Activities are append-only, human-readable event log entries.

export const ACTIVITY_TYPES = {
  ITEM_ADDED: 'item_added',
  ITEM_BOUGHT: 'item_bought',
  MEMBER_JOINED: 'member_joined',
  FAMILY_CREATED: 'family_created',
};

/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} familyId
 * @property {string} type          - one of ACTIVITY_TYPES
 * @property {string} actorId       - uid of who did it
 * @property {string} actorName
 * @property {string} message       - pre-rendered display text, e.g. "Sarah added Milk"
 * @property {number} timestamp
 */

/**
 * @param {Partial<Activity>} data
 * @returns {Activity}
 */
export const createActivity = (data) => ({
  id: data.id,
  familyId: data.familyId,
  type: data.type,
  actorId: data.actorId,
  actorName: data.actorName,
  message: data.message,
  timestamp: data.timestamp ?? Date.now(),
});

/** Builds a consistent, human-readable message per activity type. */
export const buildActivityMessage = (type, { actorName, itemName, familyName }) => {
  switch (type) {
    case ACTIVITY_TYPES.ITEM_ADDED:
      return `${actorName} added ${itemName}`;
    case ACTIVITY_TYPES.ITEM_BOUGHT:
      return `${actorName} bought ${itemName}`;
    case ACTIVITY_TYPES.MEMBER_JOINED:
      return `${actorName} joined the family`;
    case ACTIVITY_TYPES.FAMILY_CREATED:
      return `${actorName} created ${familyName}`;
    default:
      return `${actorName} did something`;
  }
};
