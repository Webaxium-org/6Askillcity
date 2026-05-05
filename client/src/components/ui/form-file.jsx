import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const FormFile = React.forwardRef(({ label, error, className, id, multiple, ...props }, ref) => {
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
        <input
          id={id}
          type="file"
          ref={ref}
          multiple={multiple}
          className={cn(
            "flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
            "file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-semibold file:mr-4 file:px-4 file:py-1.5 file:rounded-full hover:file:bg-blue-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors cursor-pointer",
            error 
              ? "border-red-500 focus-visible:ring-red-500" 
              : "border-slate-200 focus-visible:ring-blue-500/50",
          )}
          {...props}
        />
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute right-0 top-11 text-xs text-red-500 flex items-center gap-1 mt-1 font-medium bg-white px-2 py-1 rounded shadow-sm border border-red-100 z-10"
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

FormFile.displayName = 'FormFile';
