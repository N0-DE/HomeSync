// src/components/EmptyState.jsx
// Generic "nothing here yet" placeholder, reused across Shopping/Activity/etc.

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fadeIn">
      {Icon && (
        <div className="h-14 w-14 rounded-full bg-brand-100 flex items-center justify-center mb-4">
          <Icon className="h-7 w-7 text-brand-600" />
        </div>
      )}
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
