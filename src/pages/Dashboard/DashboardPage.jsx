// src/pages/Dashboard/DashboardPage.jsx
//
// Owned by Developer 1. Landing page after login: quick stats,
// pending items preview, recent activity preview. Reads via hooks
// (useShoppingList, useActivityFeed) which wrap the services.

import { Link } from 'react-router-dom';
import { ShoppingCart, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import { useShoppingList } from '../../hooks/useShoppingList';
import { useActivityFeed } from '../../hooks/useActivityFeed';
import { ITEM_STATUS } from '../../models/ShoppingItem';
import ShoppingItemCard from '../../components/ShoppingItemCard';
import ActivityItem from '../../components/ActivityItem';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Avatar from '../../components/Avatar';
import { ROUTES } from '../../utils/constants';
import { toggleItemStatus, deleteItem } from '../../services/shoppingService';
import { useToast } from '../../components/Toast';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { family, members, loading: familyLoading } = useFamily();
  const { items, loading: itemsLoading } = useShoppingList(family?.id);
  const { activities, loading: activityLoading } = useActivityFeed(family?.id);
  const { showToast } = useToast();

  if (!familyLoading && !family) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <EmptyState
          icon={Users}
          title="No family yet"
          description="Create a family or join one with an invite code to get started."
          action={
            <div className="flex gap-2">
              <Link to={ROUTES.CREATE_FAMILY} className="btn-primary">
                Create family
              </Link>
              <Link to={ROUTES.JOIN_FAMILY} className="btn-secondary">
                Join family
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const pending = items.filter((i) => i.status === ITEM_STATUS.PENDING);
  const bought = items.filter((i) => i.status === ITEM_STATUS.BOUGHT);

  const handleToggle = async (item) => {
    try {
      await toggleItemStatus({
        itemId: item.id,
        currentStatus: item.status,
        itemName: item.name,
        familyId: family.id,
        userId: profile.uid,
        userName: profile.name,
      });
    } catch {
      showToast('Could not update item.', 'error');
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteItem(item.id);
      showToast('Item removed.', 'success');
    } catch {
      showToast('Could not remove item.', 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24 md:pb-8">
      <header className="mb-6">
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h1 className="text-2xl font-bold text-slate-800">{profile?.name?.split(' ')[0] ?? 'there'} 👋</h1>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard icon={ShoppingCart} label="Pending" value={pending.length} color="text-brand-600" />
        <StatCard icon={CheckCircle2} label="Bought" value={bought.length} color="text-blue-600" />
        <StatCard icon={Users} label="Members" value={members.length} color="text-purple-600" />
      </div>

      {/* Family card */}
      {family && (
        <div className="card flex items-center justify-between mb-6">
          <div>
            <p className="font-semibold text-slate-800">{family.name}</p>
            <p className="text-xs text-slate-400">Invite code: {family.inviteCode}</p>
          </div>
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((m) => (
              <Avatar key={m.uid} name={m.name} photoURL={m.photoURL} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Pending items preview */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Pending items</h2>
          <Link to={ROUTES.SHOPPING} className="text-sm text-brand-600 font-medium flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {itemsLoading ? (
          <LoadingSkeleton rows={2} />
        ) : pending.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Nothing pending" description="Your shopping list is all caught up." />
        ) : (
          <div className="space-y-2">
            {pending.slice(0, 3).map((item) => (
              <ShoppingItemCard key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>

      {/* Recent activity preview */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Recent activity</h2>
          <Link to={ROUTES.ACTIVITY} className="text-sm text-brand-600 font-medium flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {activityLoading ? (
          <LoadingSkeleton rows={2} />
        ) : activities.length === 0 ? (
          <EmptyState title="No activity yet" description="Actions from your family will show up here." />
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 3).map((a) => (
              <ActivityItem key={a.id} activity={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex flex-col items-center py-4">
      <Icon className={`h-5 w-5 mb-1 ${color}`} />
      <span className="text-xl font-bold text-slate-800">{value}</span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
