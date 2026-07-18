// src/pages/Login/LoginPage.jsx
//
// Owned by Developer 1. Calls authService functions only — no direct
// Firebase imports here.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBasket, Loader2 } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../../services/authService';
import { isValidEmail, isValidPassword, isNonEmpty } from '../../utils/validators';
import { useToast } from '../../components/Toast';
import { ROUTES } from '../../utils/constants';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const validate = () => {
    if (!isValidEmail(email)) return 'Enter a valid email address.';
    if (!isValidPassword(password)) return 'Password must be at least 6 characters.';
    if (mode === 'signup' && !isNonEmpty(name)) return 'Enter your name.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await signUpWithEmail({ name, email, password });
        showToast('Welcome to HomeSync!', 'success');
      } else {
        await signInWithEmail({ email, password });
      }
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-brand-50 to-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-3">
            <ShoppingBasket className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">HomeSync</h1>
          <p className="text-sm text-slate-500 mt-1">Family shopping, in sync.</p>
        </div>

        <div className="card">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  mode === m ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <input
                className="input-field"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs text-slate-400">or</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <button onClick={handleGoogle} disabled={loading} className="btn-secondary w-full">
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
