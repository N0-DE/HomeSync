// src/pages/Map/MapPage.jsx
//
// Owned by Developer 1 for layout, but wired entirely through
// mapService/useGeofencing (Developer 2). Shows nearby supermarkets/
// pharmacies and a live toggle for location-based reminders.
// Updated to use Leaflet & OpenStreetMap (free alternate API).

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Bell, BellOff } from 'lucide-react';
import { getCurrentPosition, findNearbyStores } from '../../services/mapService';
import { useGeofencing } from '../../hooks/useGeofencing';
import { useFamily } from '../../context/FamilyContext';
import { useShoppingList } from '../../hooks/useShoppingList';
import { getPendingItems } from '../../services/shoppingService';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for Geofence Hits
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }; // fallback until geolocation resolves

// Component to recenter map when center state changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
}

export default function MapPage() {
  const { family } = useFamily();
  const { items } = useShoppingList(family?.id);
  const { showToast } = useToast();

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remindersOn, setRemindersOn] = useState(false);

  const { nearbyHits } = useGeofencing({
    enabled: remindersOn,
    stores,
    shoppingItems: items,
    familyId: family?.id,
  });

  const loadNearbyStores = useCallback(async (location) => {
    setLoading(true);
    const found = await findNearbyStores(location);
    setStores(found);
    setLoading(false);
  }, []);

  useEffect(() => {
    getCurrentPosition()
      .then((location) => {
        setCenter(location);
        loadNearbyStores(location);
      })
      .catch(() => {
        showToast('Could not get your location — showing default area.', 'info');
        loadNearbyStores(DEFAULT_CENTER);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleReminders = () => {
    setRemindersOn((prev) => {
      const next = !prev;
      showToast(next ? 'Store reminders enabled' : 'Store reminders paused', 'info');
      return next;
    });
  };

  const pendingCount = getPendingItems(items).length;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24 md:pb-8 flex flex-col h-screen md:h-auto">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nearby Stores</h1>
          <p className="text-sm text-slate-500">{pendingCount} item(s) pending</p>
        </div>
        <button
          onClick={toggleReminders}
          className={`flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2 transition-colors ${
            remindersOn ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {remindersOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          {remindersOn ? 'Reminders on' : 'Reminders off'}
        </button>
      </header>

      <div className="flex-1 min-h-[320px] rounded-2xl overflow-hidden border border-slate-100 mb-4 relative z-0">
        <MapContainer center={[center.lat, center.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={center} />
          <Marker position={[center.lat, center.lng]}>
            <Popup>You are here</Popup>
          </Marker>
          {stores.map((store) => (
            <Marker
              key={store.id}
              position={[store.location.lat, store.location.lng]}
              icon={nearbyHits.some((h) => h.id === store.id) ? greenIcon : redIcon}
            >
              <Popup>
                <strong>{store.name}</strong><br/>
                {store.vicinity}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {loading ? (
        <LoadingSkeleton rows={2} />
      ) : stores.length === 0 ? (
        <EmptyState icon={MapPin} title="No stores found nearby" description="Try again once you're closer to a supermarket or pharmacy." />
      ) : (
        <div className="space-y-2">
          {stores.map((store) => (
            <div key={store.id} className="card flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <Navigation className="h-4 w-4 text-brand-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-800 truncate">{store.name}</p>
                <p className="text-xs text-slate-400 truncate">{store.vicinity}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
