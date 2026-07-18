// src/pages/Shopping/ShoppingPage.jsx
//
// Owned by Developer 1. Full shopping list with tabs (Pending/Bought),
// manual Add Item, and AI Quick Add. All writes go through
// shoppingService — this file never imports Firestore.

import { useState } from 'react';
import { Plus, Sparkles, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import { useShoppingList } from '../../hooks/useShoppingList';
import { ITEM_STATUS } from '../../models/ShoppingItem';
import {
  addItem,
  addItems,
  toggleItemStatus,
  deleteItem,
} from '../../services/shoppingService';
import ShoppingItemCard from '../../components/ShoppingItemCard';
import AddItemModal from '../../components/AddItemModal';
import AiQuickAddModal from '../../components/AiQuickAddModal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import FloatingActionButton from '../../components/FloatingActionButton';
import { useToast } from '../../components/Toast';

export default function ShoppingPage() {
  const [tab, setTab] = useState(ITEM_STATUS.PENDING);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const { profile } = useAuth();
  const { family } = useFamily();
  const { items, loading } = useShoppingList(family?.id);
  const { showToast } = useToast();

  const filtered = items.filter((i) => i.status === tab);

  const handleAdd = async ({ name, category, quantity }) => {
    try {
      await addItem({
        familyId: family.id,
        name,
        category,
        quantity,
        addedBy: profile.uid,
        addedByName: profile.name,
      });
      showToast(`${name} added to the list`, 'success');
    } catch {
      showToast('Could not add item.', 'error');
    }
  };

  const handleAiConfirm = async (extractedItems) => {
    try {
      await addItems(extractedItems, { familyId: family.id, addedBy: profile.uid, addedByName: profile.name });
      showToast(`${extractedItems.length} item(s) added`, 'success');
    } catch {
      showToast('Could not add items.', 'error');
    }
  };

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
    } catch {
      showToast('Could not remove item.', 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto pb-28 md:pb-8">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Shopping List</h1>
        <p className="text-sm text-slate-500">{family?.name}</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4 w-fit">
        {[ITEM_STATUS.PENDING, ITEM_STATUS.BOUGHT].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
              tab === t ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* AI Quick Add entry point */}
      <button
        onClick={() => setAiModalOpen(true)}
        className="w-full mb-4 flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600
          text-white rounded-xl px-4 py-3 text-sm font-medium shadow-sm hover:opacity-95 transition-opacity"
      >
        <Sparkles className="h-4 w-4" />
        Try AI Quick Add — "Add milk, bread and toothpaste"
      </button>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={tab === ITEM_STATUS.PENDING ? 'Nothing pending' : 'Nothing bought yet'}
          description={
            tab === ITEM_STATUS.PENDING
              ? 'Add items manually or try AI Quick Add above.'
              : 'Items marked as bought will show up here.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <ShoppingItemCard key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={Plus} label="Add item" />

      <AddItemModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAdd} />
      <AiQuickAddModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} onConfirm={handleAiConfirm} />
    </div>
  );
}
