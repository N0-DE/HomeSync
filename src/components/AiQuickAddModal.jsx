// src/components/AiQuickAddModal.jsx
//
// "AI Quick Add" — user types a free-text sentence, Gemini (via
// aiService.extractItemsFromText) returns structured items, the user
// reviews/edits them, then confirms to bulk-add via onConfirm.

import { useState, useRef } from 'react';
import { X, Sparkles, Loader2, Mic, MicOff } from 'lucide-react';
import { extractItemsFromText } from '../services/aiService';

import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export default function AiQuickAddModal({ open, onClose, onConfirm }) {
  const [text, setText] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  if (!open) return null;

  const toggleListening = async () => {
    if (isListening) {
      try { await SpeechRecognition.stop(); } catch (e) {}
      setIsListening(false);
      return;
    }

    try {
      const perms = await SpeechRecognition.requestPermissions();
      if (perms.speechRecognition !== 'granted') {
        setError("Microphone permission was denied. Please enable it in Settings.");
        return;
      }

      const { available } = await SpeechRecognition.available();
      if (!available) {
        setError("Speech recognition is not available on this device.");
        return;
      }

      setIsListening(true);
      setError(null);
      
      await SpeechRecognition.removeAllListeners();
      
      await SpeechRecognition.addListener('partialResults', (data) => {
        if (data.matches && data.matches.length > 0) {
          setText(data.matches[0]);
        }
      });
      
      await SpeechRecognition.start({
        language: "en-US",
        maxResults: 1,
        prompt: "Say your shopping items",
        partialResults: true,
        popup: false,
      });
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
      setError(`Microphone error: ${err.message}`);
    }
  };

  const handleExtract = async () => {
    if (!text.trim()) return;
    if (isListening) {
      try { await SpeechRecognition.stop(); } catch (e) {}
      setIsListening(false);
    }
    
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

  const reset = async () => {
    if (isListening) {
      try { await SpeechRecognition.stop(); } catch (e) {}
      setIsListening(false);
    }
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">
                Type or speak items — e.g. "Add milk and bread".
              </p>
              <button
                onClick={toggleListening}
                className={`p-2 rounded-full transition-colors ${
                  isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>
            
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
              disabled={loading || (!text.trim() && !isListening)}
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
