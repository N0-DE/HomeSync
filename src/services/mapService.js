// src/services/mapService.js
//
// Owned by Developer 2. Wraps Google Maps / Places / Geolocation so the
// UI (Developer 1) just calls plain functions and never touches the
// Google Maps SDK directly.

import { RELEVANT_PLACE_TYPES, GEOFENCE_RADIUS_METERS } from '../utils/constants';

/** Gets the browser's current position as a Promise. */
export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

/**
 * Watches the user's position continuously, calling `onPosition` on each
 * update. Returns a function to stop watching.
 */
export const watchPosition = (onPosition, onError) => {
  if (!navigator.geolocation) {
    onError?.(new Error('Geolocation is not supported by this browser.'));
    return () => {};
  }
  const watchId = navigator.geolocation.watchPosition(
    (pos) => onPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    (err) => onError?.(err),
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
  );
  return () => navigator.geolocation.clearWatch(watchId);
};

/** Haversine distance between two lat/lng points, in meters. */
export const distanceInMeters = (a, b) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/**
 * Finds nearby supermarkets/pharmacies using the free Overpass API.
 *
 * @param {{lat: number, lng: number}} location
 * @returns {Promise<Array<{ id: string, name: string, location: {lat, lng}, vicinity: string }>>}
 */
export const findNearbyStores = async (location) => {
  const query = `
    [out:json];
    (
      node["shop"="supermarket"](around:${GEOFENCE_RADIUS_METERS}, ${location.lat}, ${location.lng});
      node["amenity"="pharmacy"](around:${GEOFENCE_RADIUS_METERS}, ${location.lat}, ${location.lng});
    );
    out center;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.elements.map((el) => ({
      id: el.id.toString(),
      name: el.tags?.name || 'Unnamed Store',
      vicinity: el.tags?.['addr:street'] || 'Nearby',
      location: { lat: el.lat ?? el.center?.lat, lng: el.lon ?? el.center?.lon },
    })).filter(store => store.location.lat && store.location.lng);
  } catch (error) {
    console.error("Overpass API error:", error);
    return [];
  }
};

/**
 * Given the user's current location and a list of known store locations,
 * returns stores that are within GEOFENCE_RADIUS_METERS ("geofence hit").
 */
export const checkGeofenceHits = (userLocation, stores) =>
  stores.filter((store) => distanceInMeters(userLocation, store.location) <= GEOFENCE_RADIUS_METERS);
