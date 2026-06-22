import React from 'react';

export default function Input({ className = '', type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={`flex h-11 w-full rounded-2xl px-3.5 py-2 text-sm placeholder:text-slate-400/80 focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-100 glossy-input ${className}`}
      {...props}
    />
  );
}
