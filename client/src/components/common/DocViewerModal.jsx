import React from "react";
import { motion } from "framer-motion";
import { FileDigit, X } from "lucide-react";

export default function DocViewerModal({ url, title, onClose, isOpen }) {
  if (!isOpen || !url) return null;
  const isImage = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(url);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card border border-border w-full max-w-5xl h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileDigit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest leading-none">
                {title}
              </h3>
              <p className="text-[10px] text-muted-foreground font-bold mt-1">
                DOCUMENT PREVIEW
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-muted/10 overflow-hidden relative flex items-center justify-center">
          {isImage ? (
            <img
              src={url}
              alt={title}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <iframe
              src={`${url}#toolbar=0`}
              className="w-full h-full border-none"
              title={title}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
