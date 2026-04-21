import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ServerCrash, RefreshCcw, Home } from 'lucide-react';

export default function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden text-foreground">
      {/* Background danger gradients */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-red-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] opacity-60" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center px-4"
      >
        <div className="mb-6 relative group">
          <motion.div
            animate={{ 
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" 
          />
          <div className="w-28 h-28 bg-card border border-red-500/20 rounded-3xl flex items-center justify-center relative z-10 shadow-lg">
            <ServerCrash className="w-14 h-14 text-red-500" />
          </div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-red-500/50" />
            <h1 className="text-xl font-bold tracking-widest text-red-500 uppercase">Error 500</h1>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-red-500/50" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Internal Server Error
          </h2>
          
          <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg">
            Our servers seem to have hit a snag. We've automatically been notified of the issue and are looking into it.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl border border-red-500/20 bg-card hover:bg-red-500/10 text-foreground font-medium flex items-center gap-2 transition-all shadow-sm w-full sm:w-auto justify-center"
            >
              <RefreshCcw className="w-5 h-5 text-red-500" />
              <span>Try Again</span>
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 flex items-center gap-2 transition-all shadow-md w-full sm:w-auto justify-center"
            >
              <Home className="w-5 h-5" />
              <span>Return Home</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
