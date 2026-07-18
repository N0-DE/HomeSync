// src/components/AiQuickAddModal.jsx
//
// "AI Quick Add" — user types a free-text sentence, Gemini (via
// aiService.extractItemsFromText) returns structured items, the user
// reviews/edits them, then confirms to bulk-add via onConfirm.

import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { extractItemsFromText } from '../services/aiService';

export default function AiQuickAddModal({ open, onClose, onConfirm }) {
  const [text, setText] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleExtract = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const items = await extractItemsFromText(text);
      setExtracted(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(extracted);
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setText('');
    setExtracted(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            AI Quick Add
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!extracted ? (
          <>
            <p className="text-sm text-slate-500 mb-2">
              Type items naturally — e.g. "Add milk, bread and toothpaste".
            </p>
            <textarea
              autoFocus
              className="input-field min-h-[90px] resize-none"
              placeholder="Add milk, bread and toothpaste"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <button
              onClick={handleExtract}
              disabled={loading || !text.trim()}
              className="btn-primary w-full mt-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Understanding…
                </>
              ) : (
                'Extract items'
              )}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-3">Found {extracted.length} item(s):</p>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {extracted.map((item, i) => (
                <li key={i} className="flex items-center justify-between bg-brand-50 rounded-xl px-3 py-2">
                  <span className="font-medium text-slate-800">
                    {item.name} {item.quantity > 1 && <span className="text-slate-400">×{item.quantity}</span>}
                  </span>
                  <span className="text-xs text-brand-700 bg-white px-2 py-0.5 rounded-full">{item.category}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setExtracted(null)} className="btn-secondary flex-1">
                Back
              </button>
              <button onClick={handleConfirm} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Adding…' : 'Add all'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
