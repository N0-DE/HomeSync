// src/pages/Map/MapPage.jsx
//
// Owned by Developer 1 for layout, but wired entirely through
// mapService/useGeofencing (Developer 2). Shows nearby supermarkets/
// pharmacies and a live toggle for location-based reminders.
// Updated to use Leaflet & OpenStreetMap (free alternate API).

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Bell, BellOff, Star } from 'lucide-react';
import { getCurrentPosition, findNearbyStores, subscribeToCustomStores, addCustomStore } from '../../services/mapService';
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

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
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

// Component to handle map clicks for adding custom stores
function MapClickHandler({ familyId, setPendingPin }) {
  useMapEvents({
    click(e) {
      if (!familyId) return;
      setPendingPin({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapPage() {
  const { family } = useFamily();
  const { items } = useShoppingList(family?.id);
  const { showToast } = useToast();

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [apiStores, setApiStores] = useState([]);
  const [customStores, setCustomStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remindersOn, setRemindersOn] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [newStoreName, setNewStoreName] = useState("");
  const [savingStore, setSavingStore] = useState(false);

  // Combine both arrays so geofencing works on all of them
  const allStores = [...customStores, ...apiStores];

  const { nearbyHits } = useGeofencing({
    enabled: remindersOn,
    stores: allStores,
    shoppingItems: items,
    familyId: family?.id,
  });

  const loadNearbyStores = useCallback(async (location) => {
    setLoading(true);
    const found = await findNearbyStores(location);
    setApiStores(found);
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

  useEffect(() => {
    if (!family?.id) return;
    const unsub = subscribeToCustomStores(family.id, (stores) => {
      setCustomStores(stores);
    });
    return () => unsub();
  }, [family?.id]);

  const toggleReminders = () => {
    setRemindersOn((prev) => {
      const next = !prev;
      showToast(next ? 'Store reminders enabled' : 'Store reminders paused', 'info');
      return next;
    });
  };
  
  const handleSaveStore = async (e) => {
    e.preventDefault();
    if (!newStoreName.trim() || !pendingPin || !family?.id) return;
    
    setSavingStore(true);
    try {
      await addCustomStore(family.id, newStoreName.trim(), pendingPin);
      showToast("Custom store added!", "success");
      setPendingPin(null);
      setNewStoreName("");
    } catch (err) {
      showToast("Failed to add store", "error");
    } finally {
      setSavingStore(false);
    }
  };

  const pendingCount = getPendingItems(items).length;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24 md:pb-8 flex flex-col h-screen md:h-auto">
      <header className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nearby Stores</h1>
          <p className="text-sm text-slate-500">Tap anywhere on the map to add a custom pin!</p>
        </div>
        <button
          onClick={toggleReminders}
          className={`flex items-center justify-center gap-2 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors ${
            remindersOn ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {remindersOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          {remindersOn ? 'Reminders on' : 'Reminders off'}
        </button>
      </header>

      <div className="flex-1 min-h-[350px] rounded-2xl overflow-hidden border border-slate-100 mb-4 relative z-0">
        <MapContainer center={[center.lat, center.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={center} />
          <MapClickHandler familyId={family?.id} setPendingPin={setPendingPin} />
          
          <Marker position={[center.lat, center.lng]}>
            <Popup>You are here</Popup>
          </Marker>
          
          {pendingPin && (
            <Marker position={[pendingPin.lat, pendingPin.lng]} icon={blueIcon}>
              <Popup>New Store Location</Popup>
            </Marker>
          )}
          
          {allStores.map((store) => (
            <Marker
              key={store.id}
              position={[store.location.lat, store.location.lng]}
              icon={store.isCustom ? blueIcon : (nearbyHits.some((h) => h.id === store.id) ? greenIcon : redIcon)}
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
      ) : allStores.length === 0 ? (
        <EmptyState icon={MapPin} title="No stores found nearby" description="Try again once you're closer to a supermarket, or tap the map to add your own!" />
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {allStores.map((store) => (
            <div key={store.id} className="card flex items-center justify-between gap-3 py-3 px-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${store.isCustom ? 'bg-blue-100' : 'bg-brand-100'}`}>
                  {store.isCustom ? <Star className="h-5 w-5 text-blue-600" /> : <Navigation className="h-5 w-5 text-brand-600" />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{store.name}</p>
                  <p className="text-xs text-slate-400 truncate">{store.vicinity}</p>
                </div>
              </div>
              {store.isCustom && (
                <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-full shrink-0">Custom</span>
              )}
            </div>
          ))}
        </div>
      )}

      {pendingPin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveStore} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Save Custom Store</h2>
            <p className="text-sm text-slate-500 mb-4">Name this location so you can receive geofenced reminders when you are nearby.</p>
            
            <input
              type="text"
              autoFocus
              placeholder="e.g. My Local Kirana"
              className="input-field mb-6"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              required
            />
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPendingPin(null);
                  setNewStoreName("");
                }}
                className="btn-secondary flex-1"
                disabled={savingStore}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={savingStore || !newStoreName.trim()}
              >
                {savingStore ? 'Saving...' : 'Save Store'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
