// src/pages/Activity/ActivityPage.jsx
// Owned by Developer 1. Reads via useActivityFeed hook only.

import { Activity as ActivityIcon } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import { useActivityFeed } from '../../hooks/useActivityFeed';
import ActivityItem from '../../components/ActivityItem';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

export default function ActivityPage() {
  const { family } = useFamily();
  const { activities, loading } = useActivityFeed(family?.id);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24 md:pb-8">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Activity</h1>
        <p className="text-sm text-slate-500">What your family's been up to</p>
      </header>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No activity yet"
          description="Adding or buying items will show up here in real time."
        />
      ) : (
        <div className="space-y-2">
          {activities.map((a) => (
            <ActivityItem key={a.id} activity={a} />
          ))}
        </div>
      )}
    </div>
  );
}
