// src/services/familyService.js
//
// Owned by Developer 2. Family group creation, joining, and lookups.

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { createFamily, generateInviteCode } from '../models/Family';
import { logActivity } from './activityService';
import { ACTIVITY_TYPES, buildActivityMessage } from '../models/Activity';

/**
 * Creates a new family, sets the creator as owner+member, and links the
 * user's profile doc to it. Generates a unique invite code (retries on
 * the rare collision).
 */
export const createFamilyGroup = async ({ name, ownerId, ownerName }) => {
  let inviteCode = generateInviteCode();
  let attempts = 0;
  while (attempts < 5 && (await findFamilyByInviteCode(inviteCode))) {
    inviteCode = generateInviteCode();
    attempts += 1;
  }

  const familyRef = doc(collection(db, COLLECTIONS.FAMILIES));
  const family = createFamily({ id: familyRef.id, name, ownerId, inviteCode });
  await setDoc(familyRef, { ...family, createdAt: serverTimestamp() });

  await updateDoc(doc(db, COLLECTIONS.USERS, ownerId), { familyId: familyRef.id });

  await logActivity({
    familyId: familyRef.id,
    type: ACTIVITY_TYPES.FAMILY_CREATED,
    actorId: ownerId,
    actorName: ownerName,
    message: buildActivityMessage(ACTIVITY_TYPES.FAMILY_CREATED, {
      actorName: ownerName,
      familyName: name,
    }),
  });

  return { ...family, id: familyRef.id };
};

/** Looks up a family document by its invite code. Returns null if not found. */
export const findFamilyByInviteCode = async (inviteCode) => {
  const q = query(
    collection(db, COLLECTIONS.FAMILIES),
    where('inviteCode', '==', inviteCode.trim().toUpperCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { ...docSnap.data(), id: docSnap.id };
};

/** Joins an existing family using an invite code. */
export const joinFamilyByCode = async ({ inviteCode, userId, userName }) => {
  const family = await findFamilyByInviteCode(inviteCode);
  if (!family) throw new Error('Invalid invite code. Double-check and try again.');

  await updateDoc(doc(db, COLLECTIONS.FAMILIES, family.id), {
    memberIds: arrayUnion(userId),
  });
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), { familyId: family.id });

  await logActivity({
    familyId: family.id,
    type: ACTIVITY_TYPES.MEMBER_JOINED,
    actorId: userId,
    actorName: userName,
    message: buildActivityMessage(ACTIVITY_TYPES.MEMBER_JOINED, { actorName: userName }),
  });

  return family;
};

/** Fetches a family document by id. */
export const getFamily = async (familyId) => {
  const snap = await getDoc(doc(db, COLLECTIONS.FAMILIES, familyId));
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
};

/** Fetches user profile docs for a list of member uids (for avatars, names). */
export const getFamilyMembers = async (memberIds) => {
  if (!memberIds?.length) return [];
  const results = await Promise.all(
    memberIds.map((uid) => getDoc(doc(db, COLLECTIONS.USERS, uid)))
  );
  return results.filter((snap) => snap.exists()).map((snap) => snap.data());
};

/** Removes a member from a family. */
export const removeMember = async ({ familyId, memberId, memberName, adminId, adminName }) => {
  // Remove from family's memberIds array
  await updateDoc(doc(db, COLLECTIONS.FAMILIES, familyId), {
    memberIds: arrayRemove(memberId),
  });
  
  // Clear the user's familyId
  await updateDoc(doc(db, COLLECTIONS.USERS, memberId), { 
    familyId: null 
  });

  // Log the activity
  await logActivity({
    familyId,
    type: ACTIVITY_TYPES.MEMBER_REMOVED,
    actorId: adminId,
    actorName: adminName,
    message: buildActivityMessage(ACTIVITY_TYPES.MEMBER_REMOVED, { 
      actorName: adminName, 
      removedName: memberName 
    }),
  });
};
