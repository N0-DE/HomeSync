// src/utils/constants.js — shared constants used across pages/services.

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  SHOPPING: '/shopping',
  ACTIVITY: '/activity',
  PROFILE: '/profile',
  CREATE_FAMILY: '/create-family',
  JOIN_FAMILY: '/join-family',
};

// Radius (meters) within which a "near a store" notification should fire.
export const GEOFENCE_RADIUS_METERS = 300;

// Store types we watch for via Places API when scanning nearby locations.
export const RELEVANT_PLACE_TYPES = ['supermarket', 'grocery_or_supermarket', 'pharmacy'];

export const NOTIFICATION_COOLDOWN_MS = 30 * 60 * 1000; // 30 min per store
