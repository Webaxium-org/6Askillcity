import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronDown } from 'lucide-react';

export const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+971", country: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

export const FormPhoneInput = React.forwardRef(({ label, error, className, id, codeValue, onCodeChange, ...props }, ref) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold leading-none text-current"
        >
          {label}
        </label>
      )}
      <div className="relative flex gap-2">
        <div className="relative w-28 shrink-0">
          <select
            value={codeValue}
            onChange={(e) => onCodeChange(e.target.value)}
            className={cn(
              "flex h-10 w-full rounded-md border bg-white px-3 py-2 pr-8 text-xs font-bold text-slate-900 appearance-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all",
              error ? "border-red-500" : "border-slate-200"
            )}
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code + c.country} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown size={14} />
          </div>
        </div>
        <div className="relative flex-1">
          <input
            id={id}
            ref={ref}
            type="tel"
            className={cn(
              "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
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
                className="absolute right-0 top-11 text-[10px] text-red-400 flex items-center gap-1 mt-1 font-medium bg-red-500/10 px-2 py-0.5 rounded z-20"
              >
                <AlertCircle size={10} />
                {error.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

FormPhoneInput.displayName = 'FormPhoneInput';
