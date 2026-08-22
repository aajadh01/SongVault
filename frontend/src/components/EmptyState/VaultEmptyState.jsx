import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Lock, Clock } from 'lucide-react';

export const VaultEmptyState = ({ sibling, onLock }) => {
  return (
    <div className="relative z-10 w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center min-h-[85vh] justify-between text-center">
      {/* Top Bar */}
      <header className="w-full flex items-center justify-end">
        <button
          onClick={onLock}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card hover:bg-rose-500/20 hover:text-rose-300 text-xs font-medium text-slate-400 transition-all"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock</span>
        </button>
      </header>

      {/* Main Empty State Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="glass-panel-glow rounded-3xl p-8 backdrop-blur-2xl border border-rose-500/20 max-w-sm shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Animated Heart Icon */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(244,63,94,0.25)]"
        >
          <Heart className="w-10 h-10 text-rose-500 fill-rose-500/80" />
        </motion.div>

        <div className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Under Preparation</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h2 className="text-2xl font-serif font-bold text-white mb-3">
          This Little Space Isn't Ready Yet
        </h2>

        <p className="text-slate-300 text-sm font-serif italic leading-relaxed mb-6">
          "Something special is being prepared here for you, {sibling?.name || 'dear sibling'}. Come back soon." ❤️
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Memories will arrive shortly</span>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="text-xs text-slate-500 font-mono">
        VAULT ID: {sibling?.cardId || 'UNKNOWN'}
      </footer>
    </div>
  );
};
