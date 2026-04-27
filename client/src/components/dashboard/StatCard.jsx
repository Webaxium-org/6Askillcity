import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const StatCard = ({ title, value, icon: Icon, trend, subtext, color = "purple", onClick }) => {
  const colorMap = {
    purple: "from-purple-500/20 to-purple-500/5 text-purple-500 border-purple-500/20",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-500 border-blue-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-500 border-emerald-500/20",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-500 border-rose-500/20",
  };

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden group",
        onClick && "cursor-pointer"
      )}
    >
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-3xl -mr-16 -mt-16 transition-opacity duration-300 opacity-50 group-hover:opacity-100",
        colorMap[color].split(" ")[0],
        colorMap[color].split(" ")[1]
      )} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
        </div>
        <div className={cn(
          "p-3 rounded-xl bg-gradient-to-br border shadow-sm",
          colorMap[color]
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-auto relative z-10 flex items-center gap-2 py-2 border-t border-border/10">
        <div className={cn("w-1.5 h-1.5 rounded-full", `bg-${colorMap[color].split('-')[1]}-500`)} />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{subtext}</span>
      </div>
    </motion.div>
  );
};
