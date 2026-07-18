// src/components/Toast.jsx
// Minimal toast system: <ToastProvider> at the app root, useToast() anywhere.

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const COLORS = {
  success: 'bg-brand-600',
  error: 'bg-red-500',
  info: 'bg-slate-800',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
        {toasts.map(({ id, message, type }) => {
          const Icon = ICONS[type];
          return (
            <div
              key={id}
              className={`${COLORS[type]} text-white rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2 text-sm animate-fadeIn`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
