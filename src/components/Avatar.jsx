// src/components/Avatar.jsx
import { getInitials } from '../utils/formatters';

export default function Avatar({ name, photoURL, size = 'md' }) {
  const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' };
  const classes = `${sizes[size]} rounded-full flex items-center justify-center font-semibold shrink-0`;

  if (photoURL) {
    return <img src={photoURL} alt={name} className={`${classes} object-cover`} />;
  }

  return (
    <div className={`${classes} bg-brand-500 text-white`} title={name}>
      {getInitials(name) || '?'}
    </div>
  );
}
