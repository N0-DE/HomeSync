// src/pages/Dashboard/JoinFamilyPage.jsx
// Owned by Developer 1. Calls familyService.joinFamilyByCode only.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Loader2 } from 'lucide-react';
import { joinFamilyByCode } from '../../services/familyService';
import { useAuth } from '../../context/AuthContext';
import { isValidInviteCode } from '../../utils/validators';
import { ROUTES } from '../../utils/constants';

export default function JoinFamilyPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidInviteCode(code)) {
      setError('Invite codes are 6 characters, e.g. 7QK2LM.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await joinFamilyByCode({ inviteCode: code, userId: user.uid, userName: profile?.name ?? 'Someone' });
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
          <Users className="h-6 w-6 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Join a family</h1>
        <p className="text-sm text-slate-500 mt-1 mb-5">Enter the invite code someone shared with you.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            className="input-field uppercase tracking-widest text-center font-semibold"
            placeholder="7QK2LM"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Join family
          </button>
        </form>

        <p className="text-sm text-center text-slate-500 mt-4">
          Don't have a code?{' '}
          <Link to={ROUTES.CREATE_FAMILY} className="text-brand-600 font-medium">
            Create a family
          </Link>
        </p>
      </div>
    </div>
  );
}
