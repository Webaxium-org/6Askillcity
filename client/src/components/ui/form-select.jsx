import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronDown } from 'lucide-react';

export const FormSelect = React.forwardRef(({ label, error, className, id, options = [], ...props }, ref) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold leading-none text-current peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors appearance-none",
            error 
              ? "border-red-500 focus-visible:ring-red-500" 
              : "border-slate-200 focus-visible:ring-blue-500/50",
          )}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown size={16} />
        </div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute right-0 top-11 text-xs text-red-400 flex items-center gap-1 mt-1 font-medium bg-red-500/10 px-2 py-1 rounded z-20"
            >
              <AlertCircle size={12} />
              {error.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

FormSelect.displayName = 'FormSelect';
