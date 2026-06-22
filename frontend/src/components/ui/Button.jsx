import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'default', // default | secondary | outline | ghost | destructive
  size = 'md', // sm | md | lg
  className = '',
  disabled = false,
  ...props
}) {
  const baseStyle = 'inline-flex items-center justify-center rounded-2xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none select-none';
  
  const variants = {
    default: 'bg-gradient-to-br from-indigo-500 via-primary-600 to-indigo-700 text-white glossy-btn shadow-md shadow-indigo-500/10',
    secondary: 'bg-white/25 dark:bg-slate-850/25 text-slate-850 dark:text-slate-100 glossy-btn backdrop-blur-xs',
    outline: 'border border-slate-300/40 dark:border-slate-800 bg-transparent hover:bg-slate-100/20 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-300 glossy-btn',
    ghost: 'bg-transparent hover:bg-white/10 dark:hover:bg-slate-900/10 text-slate-700 dark:text-slate-350 transition-all rounded-2xl',
    destructive: 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white glossy-btn shadow-md shadow-rose-500/10'
  };

  const sizes = {
    sm: 'h-9 px-3.5 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-7 text-base'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-1.5 w-full h-full">{children}</span>
    </motion.button>
  );
}
