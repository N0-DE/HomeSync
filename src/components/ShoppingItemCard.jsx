// src/components/ShoppingItemCard.jsx
//
// Single shopping list row. Purely presentational — the parent page
// wires `onToggle`/`onDelete` to shoppingService calls.

import { Check, Trash2 } from 'lucide-react';
import { ITEM_STATUS } from '../models/ShoppingItem';
import { timeAgo } from '../utils/formatters';

const CATEGORY_COLORS = {
  Dairy: 'bg-blue-50 text-blue-700',
  Bakery: 'bg-amber-50 text-amber-700',
  Produce: 'bg-green-50 text-green-700',
  'Meat & Seafood': 'bg-red-50 text-red-700',
  Pantry: 'bg-orange-50 text-orange-700',
  Frozen: 'bg-cyan-50 text-cyan-700',
  Household: 'bg-purple-50 text-purple-700',
  'Personal Care': 'bg-pink-50 text-pink-700',
  Beverages: 'bg-teal-50 text-teal-700',
  Other: 'bg-slate-100 text-slate-600',
};

export default function ShoppingItemCard({ item, onToggle, onDelete }) {
  const isBought = item.status === ITEM_STATUS.BOUGHT;

  return (
    <div className={`card flex items-center gap-3 transition-opacity ${isBought ? 'opacity-60' : ''}`}>
      <button
        onClick={() => onToggle(item)}
        aria-label={isBought ? 'Mark as pending' : 'Mark as bought'}
        className={`h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          isBought ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300 hover:border-brand-500'
        }`}
      >
        {isBought && <Check className="h-4 w-4" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-medium truncate ${isBought ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {item.name}
          </p>
          {item.quantity > 1 && <span className="text-xs text-slate-400">×{item.quantity}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other}`}>
            {item.category}
          </span>
          <span className="text-[11px] text-slate-400">
            {item.addedByName} · {item.timestamp ? timeAgo(item.timestamp) : 'just now'}
          </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(item)}
        aria-label="Delete item"
        className="text-slate-300 hover:text-red-500 transition-colors p-1"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
