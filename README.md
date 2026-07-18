# HomeSync

Smart family shopping coordination — a shared real-time shopping list with
location-based reminders and AI-powered quick add. Built as a 24-hour
hackathon MVP for a two-developer team.

## Tech Stack

React (Vite) · React Router · Firebase (Auth, Firestore, Cloud Messaging) ·
Google Maps JavaScript API · Gemini API · Tailwind CSS

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in your keys, see below
npm run dev
```

### Environment variables (`.env`)

| Variable | Where to get it |
|---|---|
| `VITE_FIREBASE_*` | Firebase Console → Project Settings → General → SDK setup |
| `VITE_FIREBASE_VAPID_KEY` | Firebase Console → Project Settings → Cloud Messaging → Web Push certificates |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Cloud Console — enable **Maps JavaScript API** + **Places API** |
| `VITE_GEMINI_API_KEY` | https://aistudio.google.com/app/apikey |

### Firestore setup

Create these collections (they're created automatically on first write, but
set up indexes ahead of time to avoid demo-day surprises):

- `users` — one doc per uid
- `families` — one doc per family, with `memberIds` array + `inviteCode`
- `shoppingItems` — composite index: `familyId` (asc) + `timestamp` (desc)
- `activities` — composite index: `familyId` (asc) + `timestamp` (desc)
- `notifications` — log of fired store reminders

Firestore will prompt you with a direct link to create missing composite
indexes the first time a query runs — just click through it.

### Recommended Firestore security rules (tighten before any real deploy)

```
match /databases/{database}/documents {
  match /users/{userId} {
    allow read: if request.auth != null;
    allow write: if request.auth.uid == userId;
  }
  match /families/{familyId} {
    allow read: if request.auth != null;
    allow write: if request.auth != null;
  }
  match /shoppingItems/{itemId} {
    allow read, write: if request.auth != null;
  }
  match /activities/{activityId} {
    allow read, write: if request.auth != null;
  }
  match /notifications/{notifId} {
    allow read, write: if request.auth != null;
  }
}
```

## Architecture — why it's split this way

```
src/
├── components/     # Reusable, presentational UI. No Firebase imports.
├── pages/          # One folder per route/feature area.
├── services/        # ALL Firebase/Google Maps/Gemini calls live here.
├── hooks/           # Thin React wrappers around services (subscriptions).
├── context/         # App-wide state: AuthContext, FamilyContext.
├── models/          # Plain-object shapes + factories for Firestore docs.
├── utils/           # Constants, validators, formatters. No side effects.
└── firebase/        # Firebase app init + collection name registry.
```

**The one rule that keeps two people from stepping on each other:**
UI components never call Firebase, Google Maps, or Gemini directly. They
call a function from `services/`. That's the entire contract.

```js
// ✅ Correct — page/component calls a service function
await shoppingService.addItem(item);

// ❌ Never — UI reaching into Firestore directly
await addDoc(collection(db, 'shoppingItems'), item);
```

This means:
- Developer 2 can change *how* data is stored/fetched (swap Firestore
  queries, add caching, change field names internally) without touching
  a single page.
- Developer 1 can redesign any screen without knowing anything about
  Firestore, Places API, or Gemini's request format.
- Merge conflicts are rare because the two of you are almost always
  editing different files (`pages/` + `components/` vs. `services/`).

## Two-Developer Split

### Developer 1 — Frontend
Owns: `components/`, `pages/`, styling, routing, connecting UI to
services (never Firebase directly).

- [x] Login / Signup screens
- [x] Create Family / Join Family screens
- [x] Dashboard (stats + previews)
- [x] Shopping List page (tabs, cards)
- [x] Add Item modal
- [x] AI Quick Add modal (calls `aiService.extractItemsFromText`)
- [x] Activity Feed page
- [x] Profile page
- [x] Bottom nav (mobile) / sidebar (desktop)
- [x] Loading skeletons, empty states, toasts

### Developer 2 — Backend & Smart Features
Owns: everything in `services/`, `firebase/`, `models/`, `hooks/`.

- [x] `authService.js` — email + Google auth, friendly error mapping
- [x] `familyService.js` — create/join family, invite codes
- [x] `shoppingService.js` — realtime CRUD + activity logging
- [x] `activityService.js` — append-only event log
- [x] `mapService.js` — geolocation, Places nearby search, geofence math
- [x] `notificationService.js` — permission, FCM token, local reminders
- [x] `aiService.js` — Gemini item extraction for AI Quick Add
- [x] Firestore data models + composite index requirements

### Suggested 24-hour timeline

| Hours | Dev 1 | Dev 2 |
|---|---|---|
| 0–2 | Set up Tailwind theme, Login UI | Firebase project + Auth service |
| 2–6 | Dashboard, Shopping List UI | Firestore models, shopping/family services |
| 6–10 | Add Item modal, AI Quick Add UI | Gemini integration, activity logging |
| 10–14 | Activity Feed, Profile | Maps + Places integration |
| 14–18 | Map page UI, polish | Geofencing + notification logic |
| 18–22 | Responsive pass, empty/loading states | End-to-end testing, Firestore rules |
| 22–24 | Demo rehearsal together | Demo rehearsal together |

## Core Features

- **Auth** — Email/password + Google sign-in
- **Family groups** — create a family or join one via a 6-character invite code
- **Shared shopping list** — name, category, quantity, added-by, timestamp, status — synced in real time via Firestore `onSnapshot`
- **AI Quick Add** — type "Add milk, bread and toothpaste" and Gemini extracts + categorizes each item
- **Location reminders** — geofencing against nearby supermarkets/pharmacies fires "You're near Reliance Smart. Milk and Bread are pending."
- **One-tap purchase confirmation** — marks an item bought, syncs instantly to all members
- **Activity feed** — "Sarah added Milk", "Alex bought Bread", "John joined the family"

## Notes for the demo

- Push notifications (FCM) require HTTPS in production; local dev over
  `http://localhost` still supports the in-app/browser `Notification` API
  used as a fallback in `notificationService.showLocalNotification`.
- Geofencing runs client-side via `navigator.geolocation.watchPosition` —
  no Cloud Function required for the MVP. A `functions/` folder can be
  added later if you want server-side triggered push instead.
