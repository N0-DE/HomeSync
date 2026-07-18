// src/components/NavBar.jsx
//
// Responsive nav: bottom tab bar on mobile, left sidebar on desktop.
// Single component so both layouts stay in sync automatically.

import { NavLink } from 'react-router-dom';
import { ShoppingCart, Activity, Map, User, Home } from 'lucide-react';
import { ROUTES } from '../utils/constants';

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: 'Home', icon: Home, end: true },
  { to: ROUTES.SHOPPING, label: 'Shopping', icon: ShoppingCart },
  { to: ROUTES.ACTIVITY, label: 'Activity', icon: Activity },
  { to: '/map', label: 'Map', icon: Map },
  { to: ROUTES.PROFILE, label: 'Profile', icon: User },
];

const linkClasses = ({ isActive }) =>
  `flex flex-col md:flex-row items-center md:gap-3 gap-1 px-3 py-2 rounded-xl transition-colors text-xs md:text-sm font-medium ${
    isActive ? 'text-brand-700 bg-brand-100' : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'
  }`;

export default function NavBar() {
  return (
    <>
      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 flex justify-around py-2 z-40">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClasses}>
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col gap-1 w-56 shrink-0 p-4 border-r border-slate-100 h-screen sticky top-0">
        <div className="flex items-center gap-2 px-2 py-4 mb-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
            H
          </div>
          <span className="font-bold text-lg text-slate-800">HomeSync</span>
        </div>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClasses}>
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
