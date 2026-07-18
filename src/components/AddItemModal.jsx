// src/components/AddItemModal.jsx
//
// Manual "add a single item" modal. Calls shoppingService.addItem directly
// via the `onAdd` prop the parent page supplies — this component never
// imports Firestore itself.

import { useState } from 'react';
import { X } from 'lucide-react';
import { ITEM_CATEGORIES } from '../models/ShoppingItem';

export default function AddItemModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(ITEM_CATEGORIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onAdd({ name: name.trim(), category, quantity });
      setName('');
      setCategory(ITEM_CATEGORIES[0]);
      setQuantity(1);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-slate-800">Add item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Item name</label>
            <input
              autoFocus
              className="input-field mt-1"
              placeholder="e.g. Milk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-500">Category</label>
              <select className="input-field mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                {ITEM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="text-xs font-medium text-slate-500">Qty</label>
              <input
                type="number"
                min={1}
                className="input-field mt-1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
            {submitting ? 'Adding…' : 'Add to list'}
          </button>
        </form>
      </div>
    </div>
  );
}
