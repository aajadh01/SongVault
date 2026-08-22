import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LockKeyholeOpen, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const UnlockOverlay = ({ sibling, onComplete }) => {
  useEffect(() => {
    // Trigger festive particle burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f43f5e', '#fb7185', '#f59e0b', '#ffffff'],
      });
    } catch (e) {
      // safe fallback
    }

    const timer = setTimeout(() => {
      onComplete?.();
    }, 2400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 text-center"
    >
      <div className="flex flex-col items-center max-w-sm">
        {/* Animated Golden Lock Icon */}
        <motion.div
          initial={{ scale: 0.5, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            duration: 0.8,
          }}
          className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500/20 via-rose-500/30 to-amber-500/20 border-2 border-rose-500/40 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(244,63,94,0.4)]"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 1] }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <LockKeyholeOpen className="w-12 h-12 text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest text-rose-400 font-bold mb-2">
            <Sparkles className="w-4 h-4" />
            <span>UNLOCKED</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <h2 className="text-3xl font-serif font-bold text-white mb-3">
            Welcome, {sibling?.name || 'Dear Sibling'}
          </h2>

          <p className="text-slate-300 font-serif italic text-base leading-relaxed">
            "{sibling?.welcomeMessage || 'Welcome to our little collection of memories. ♡'}"
          </p>

          <div className="mt-6 flex justify-center">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-bounce" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
