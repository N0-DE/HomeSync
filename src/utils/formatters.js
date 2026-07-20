// src/utils/formatters.js — display formatting helpers.

/** Formats a ms-epoch timestamp as a relative time, e.g. "5m ago". */
export const timeAgo = (timestamp) => {
  const ts = timestamp?.toMillis?.() ?? timestamp;
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

/** Returns initials for an avatar fallback, e.g. "Sarah Lee" -> "SL". */
export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
