// src/components/FloatingActionButton.jsx
// Reusable circular FAB, positioned above the mobile bottom nav.

export default function FloatingActionButton({ onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-20 md:bottom-8 right-5 md:right-10 h-14 w-14 rounded-full bg-brand-600
        hover:bg-brand-700 text-white shadow-lg flex items-center justify-center transition-transform
        hover:scale-105 active:scale-95 z-30"
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}
