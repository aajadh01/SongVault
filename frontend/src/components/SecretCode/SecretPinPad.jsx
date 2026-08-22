import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Heart, KeyRound, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export const SecretPinPad = ({ sibling, onUnlock, error, isSubmitting }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (index, value) => {
    // Only accept numeric characters
    const numeric = value.replace(/\D/g, '');
    if (!numeric) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Handle single character
    const char = numeric.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance to next input
    if (index < 5 && char !== '') {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (index === 5 && char !== '') {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        onUnlock(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        // Move to previous box
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pasteData) return;

    const chars = pasteData.slice(0, 6).split('');
    const newDigits = [...digits];
    chars.forEach((c, idx) => {
      newDigits[idx] = c;
    });
    setDigits(newDigits);

    // Focus last filled or next
    const targetIdx = Math.min(chars.length, 5);
    inputRefs.current[targetIdx]?.focus();

    if (newDigits.join('').length === 6) {
      onUnlock(newDigits.join(''));
    }
  };

  const handleKeypadPress = (num) => {
    if (isSubmitting) return;
    const firstEmptyIndex = digits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      handleChange(firstEmptyIndex, String(num));
    }
  };

  const handleKeypadBackspace = () => {
    if (isSubmitting) return;
    const filledIndices = digits
      .map((d, i) => (d !== '' ? i : -1))
      .filter((i) => i !== -1);
    if (filledIndices.length > 0) {
      const lastIdx = filledIndices[filledIndices.length - 1];
      const newDigits = [...digits];
      newDigits[lastIdx] = '';
      setDigits(newDigits);
      inputRefs.current[lastIdx]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = digits.join('');
    if (fullCode.length === 6) {
      onUnlock(fullCode);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center">
      {/* Vault Card Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
          <span>A Little Secret</span>
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-2">
          {sibling?.name ? `${sibling.name}'s Vault` : 'Secret Memory Vault'}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xs mx-auto">
          This memory is meant just for you. Enter your 6-digit secret code to unlock.
        </p>
      </motion.div>

      {/* PIN Card Box */}
      <motion.div
        animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full glass-panel-glow rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          {/* 6 Digit Input Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-6 w-full max-w-xs" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isSubmitting}
                aria-label={`Digit ${idx + 1}`}
                className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold rounded-2xl transition-all duration-300 outline-none
                  ${
                    digit !== ''
                      ? 'bg-rose-500/20 border-2 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-black/40 border border-white/10 text-white/90 hover:border-white/20 focus:border-rose-400 focus:bg-rose-950/20 focus:shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  }
                `}
              />
            ))}
          </div>

          {/* Hint Section */}
          {sibling?.hint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-6 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-300 font-medium mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Memory Hint</span>
              </div>
              <p className="text-sm italic text-slate-300 font-serif">
                "{sibling.hint}"
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-medium mb-6 text-center"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unlock Action Button */}
          <button
            type="submit"
            disabled={digits.join('').length !== 6 || isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-400 hover:via-rose-500 hover:to-pink-500 text-white font-semibold shadow-[0_4px_25px_rgba(244,63,94,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Opening Vault...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                <span>Unlock Vault ♡</span>
              </>
            )}
          </button>
        </form>

        {/* Mobile-Friendly Virtual Keypad for Easy Tapping */}
        <div className="mt-8 pt-6 border-t border-white/5 sm:hidden">
          <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                disabled={isSubmitting}
                className="h-12 rounded-xl bg-white/[0.04] active:bg-rose-500/20 text-white text-lg font-semibold hover:bg-white/[0.08] transition-colors border border-white/5"
              >
                {num}
              </button>
            ))}
            <div className="flex items-center justify-center text-xs text-slate-500 font-mono">
              {sibling?.cardId}
            </div>
            <button
              type="button"
              onClick={() => handleKeypadPress(0)}
              disabled={isSubmitting}
              className="h-12 rounded-xl bg-white/[0.04] active:bg-rose-500/20 text-white text-lg font-semibold hover:bg-white/[0.08] transition-colors border border-white/5"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleKeypadBackspace}
              disabled={isSubmitting}
              className="h-12 rounded-xl bg-white/[0.04] active:bg-rose-500/20 text-rose-300 text-sm font-semibold hover:bg-white/[0.08] transition-colors border border-white/5 flex items-center justify-center"
            >
              ⌫
            </button>
          </div>
        </div>
      </motion.div>

      {/* Subtle Security Badge */}
      <div className="mt-8 flex items-center gap-1.5 text-xs text-slate-500">
        <Lock className="w-3.5 h-3.5" />
        <span>End-to-End Vault Encryption</span>
      </div>
    </div>
  );
};
