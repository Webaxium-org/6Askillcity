import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, MoveLeft, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden text-foreground">
      {/* Background dynamic blur gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center px-4"
      >
        <motion.div
          animate={{ 
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <Compass className="w-32 h-32 text-primary relative z-10" />
        </motion.div>

        <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground drop-shadow-sm mb-4">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Looks like you're lost in space.
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg">
          The page you are looking for doesn't exist or has been moved to another coordinate.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium flex items-center gap-2 transition-all shadow-sm w-full sm:w-auto justify-center"
          >
            <MoveLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center gap-2 transition-all shadow-md w-full sm:w-auto justify-center"
          >
            <Home className="w-5 h-5" />
            <span>Return Home</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
