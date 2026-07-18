// src/components/ActivityItem.jsx

import { PlusCircle, CheckCircle2, UserPlus, Home } from 'lucide-react';
import { ACTIVITY_TYPES } from '../models/Activity';
import { timeAgo } from '../utils/formatters';
import Avatar from './Avatar';

const ICONS = {
  [ACTIVITY_TYPES.ITEM_ADDED]: { icon: PlusCircle, color: 'text-brand-600' },
  [ACTIVITY_TYPES.ITEM_BOUGHT]: { icon: CheckCircle2, color: 'text-blue-600' },
  [ACTIVITY_TYPES.MEMBER_JOINED]: { icon: UserPlus, color: 'text-purple-600' },
  [ACTIVITY_TYPES.FAMILY_CREATED]: { icon: Home, color: 'text-amber-600' },
};

export default function ActivityItem({ activity }) {
  const { icon: Icon, color } = ICONS[activity.type] ?? ICONS[ACTIVITY_TYPES.ITEM_ADDED];

  return (
    <div className="card flex items-center gap-3">
      <Avatar name={activity.actorName} size="sm" />
      <Icon className={`h-4 w-4 shrink-0 ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 truncate">{activity.message}</p>
        <p className="text-[11px] text-slate-400">
          {activity.timestamp ? timeAgo(activity.timestamp) : 'just now'}
        </p>
      </div>
    </div>
  );
}
