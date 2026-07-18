// src/pages/Profile/ProfilePage.jsx
// Owned by Developer 1. Calls authService.logOut + notificationService for push opt-in.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import { logOut } from '../../services/authService';
import { requestNotificationAccess, registerPushToken } from '../../services/notificationService';
import Avatar from '../../components/Avatar';
import { useToast } from '../../components/Toast';
import { ROUTES } from '../../utils/constants';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { family, members } = useFamily();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const handleLogout = async () => {
    await logOut();
    navigate(ROUTES.LOGIN);
  };

  const handleCopyCode = async () => {
    if (!family) return;
    await navigator.clipboard.writeText(family.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationAccess();
    if (granted) {
      await registerPushToken(user.uid);
      setNotifEnabled(true);
      showToast('Notifications enabled', 'success');
    } else {
      showToast('Notification permission was denied', 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24 md:pb-8">
      <header className="mb-6 flex flex-col items-center text-center">
        <Avatar name={profile?.name} photoURL={profile?.photoURL} size="lg" />
        <h1 className="text-xl font-bold text-slate-800 mt-3">{profile?.name}</h1>
        <p className="text-sm text-slate-500">{profile?.email}</p>
      </header>

      {family && (
        <div className="card mb-4">
          <p className="text-xs font-medium text-slate-400 mb-1">FAMILY</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">{family.name}</p>
              <p className="text-xs text-slate-400">{members.length} member(s)</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-sm text-brand-700 bg-brand-50 rounded-lg px-3 py-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {family.inviteCode}
            </button>
          </div>

          <div className="flex -space-x-2 mt-3">
            {members.map((m) => (
              <Avatar key={m.uid} name={m.name} photoURL={m.photoURL} size="sm" />
            ))}
          </div>
        </div>
      )}

      <button onClick={handleEnableNotifications} disabled={notifEnabled} className="card w-full flex items-center gap-3 mb-2 text-left">
        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
          <Bell className="h-5 w-5 text-brand-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-slate-800">Store reminders</p>
          <p className="text-xs text-slate-400">
            {notifEnabled ? 'Enabled — you\'ll be notified near stores' : 'Get notified when near a supermarket'}
          </p>
        </div>
      </button>

      <button onClick={handleLogout} className="card w-full flex items-center gap-3 text-left hover:bg-red-50 transition-colors">
        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
          <LogOut className="h-5 w-5 text-red-500" />
        </div>
        <p className="font-medium text-red-500">Log out</p>
      </button>
    </div>
  );
}
