// src/components/AppLayout.jsx
// Wraps authenticated pages with the responsive NavBar.

import NavBar from './NavBar';

export default function AppLayout({ children }) {
  return (
    <div className="md:flex min-h-screen bg-brand-50/40">
      <NavBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
