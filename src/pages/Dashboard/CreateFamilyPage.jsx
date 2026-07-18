// src/pages/Dashboard/CreateFamilyPage.jsx
// Owned by Developer 1. Calls familyService.createFamilyGroup only.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Loader2 } from 'lucide-react';
import { createFamilyGroup } from '../../services/familyService';
import { useAuth } from '../../context/AuthContext';
import { isNonEmpty } from '../../utils/validators';
import { ROUTES } from '../../utils/constants';

export default function CreateFamilyPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isNonEmpty(name)) {
      setError('Give your family a name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createFamilyGroup({ name: name.trim(), ownerId: user.uid, ownerName: profile?.name ?? 'Someone' });
      await refreshProfile();
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-brand-50">
      <div className="w-full max-w-sm card">
        <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
          <Home className="h-6 w-6 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Create your family</h1>
        <p className="text-sm text-slate-500 mt-1 mb-5">
          You'll get an invite code to share with family members.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            className="input-field"
            placeholder="e.g. The Smiths"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create family
          </button>
        </form>

        <p className="text-sm text-center text-slate-500 mt-4">
          Have an invite code?{' '}
          <Link to={ROUTES.JOIN_FAMILY} className="text-brand-600 font-medium">
            Join instead
          </Link>
        </p>
      </div>
    </div>
  );
}
