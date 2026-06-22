import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-[360px] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  const iconMap = {
    success: <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="text-rose-500 w-5 h-5 flex-shrink-0" />,
    warning: <AlertCircle className="text-amber-500 w-5 h-5 flex-shrink-0" />,
    info: <Info className="text-blue-500 w-5 h-5 flex-shrink-0" />
  };

  const borderColors = {
    success: 'border-l-4 border-l-emerald-500',
    error: 'border-l-4 border-l-rose-500',
    warning: 'border-l-4 border-l-amber-500',
    info: 'border-l-4 border-l-blue-500'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95, transition: { duration: 0.2 } }}
      className={`pointer-events-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-4 flex gap-3 items-start justify-between ${borderColors[toast.type]}`}
    >
      <div className="flex gap-3 items-start">
        {iconMap[toast.type]}
        <div className="space-y-0.5 text-xs sm:text-sm">
          <h4 className="font-bold text-slate-800 dark:text-white leading-tight">{toast.title}</h4>
          {toast.description && (
            <p className="text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{toast.description}</p>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => removeToast(toast.id)}
        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
