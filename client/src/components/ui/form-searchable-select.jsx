import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronDown, Search, Check, X } from 'lucide-react';

export const FormSearchableSelect = ({ 
  label, 
  error, 
  className, 
  id, 
  options = [], 
  value, 
  onChange, 
  onBlur,
  placeholder = "Select an option",
  disabled = false,
  loading = false,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(opt => {
      const label = (opt.label || opt).toString().toLowerCase();
      return label.includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm]);

  const selectedOption = useMemo(() => {
    return options.find(opt => (opt.value || opt) === value);
  }, [options, value]);

  const handleSelect = (option) => {
    const val = option.value || option;
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className={cn("space-y-2 relative", className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold leading-none text-current peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled || loading}
          onClick={() => setIsOpen(!isOpen)}
          onBlur={onBlur}
          className={cn(
            "flex min-h-[40px] w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all text-left",
            error 
              ? "border-red-500 focus:ring-red-500" 
              : "border-slate-200 focus:ring-blue-500/50",
            isOpen && "border-blue-500 ring-2 ring-blue-500/20"
          )}
        >
          <span className={cn("block truncate", !selectedOption && "text-slate-500")}>
            {loading ? "Loading..." : selectedOption ? (selectedOption.label || selectedOption) : placeholder}
          </span>
          <div className="flex items-center gap-2">
            {selectedOption && !disabled && !loading && (
              <X 
                size={14} 
                className="text-slate-400 hover:text-slate-600 transition-colors" 
                onClick={clearSelection}
              />
            )}
            <ChevronDown 
              size={16} 
              className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} 
            />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl dark:bg-slate-900/95 dark:border-slate-800"
            >
              <div className="sticky top-0 p-2 bg-white/50 backdrop-blur-md dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    ref={inputRef}
                    autoFocus
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-48 custom-scrollbar">
                {filteredOptions.length > 0 ? (
                  <div className="p-1">
                    {filteredOptions.map((option, idx) => {
                      const optValue = option.value || option;
                      const optLabel = option.label || option;
                      const isSelected = value === optValue;
                      
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelect(option)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-lg transition-all text-left group",
                            isSelected 
                              ? "bg-primary/10 text-primary font-bold" 
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          <span className="truncate">{optLabel}</span>
                          {isSelected && <Check size={14} className="text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-xs text-slate-400 font-medium italic">No results found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute right-0 top-11 text-xs text-red-400 flex items-center gap-1 mt-1 font-medium bg-red-500/10 px-2 py-1 rounded z-20 pointer-events-none"
            >
              <AlertCircle size={12} />
              {error.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
