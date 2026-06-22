import React from 'react';

export default function Badge({ children, variant = 'default', className = '', ...props }) {
  const baseStyle = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-all select-none';
  
  const variants = {
    default: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300 backdrop-blur-xs shadow-xs',
    secondary: 'border-slate-300/30 dark:border-slate-800 bg-slate-100/15 dark:bg-slate-800/15 text-slate-700 dark:text-slate-300 backdrop-blur-xs shadow-xs',
    destructive: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300 backdrop-blur-xs shadow-xs',
    outline: 'border-slate-300/40 dark:border-slate-800 bg-transparent text-slate-655 dark:text-slate-350 backdrop-blur-xs shadow-xs',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300 backdrop-blur-xs shadow-xs'
  };

  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
