import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVault } from '../../context/VaultContext';
import { SecretPinPad } from '../../components/SecretCode/SecretPinPad';
import { UnlockOverlay } from '../../components/UnlockAnimation/UnlockOverlay';
import { BackgroundMedia } from '../../components/BackgroundMedia/BackgroundMedia';
import { MusicPlayer } from '../../components/MusicPlayer/MusicPlayer';
import { SongGrid } from '../../components/SongSelector/SongGrid';
import { VaultEmptyState } from '../../components/EmptyState/VaultEmptyState';
import { Loader2, HeartCrack, RefreshCw } from 'lucide-react';

export const PublicVault = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();

  const {
    publicSibling,
    unlockedSibling,
    recordings,
    activeRecording,
    isUnlocked,
    isLoadingPublic,
    isLoadingPrivate,
    isPlaying,
    setIsPlaying,
    error,
    loadPublicVault,
    unlockWithCode,
    lockVault,
    selectRecording,
    nextSong,
    prevSong,
  } = useVault();

  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [codeError, setCodeError] = useState(null);

  // Load public card metadata on mount or when cardId changes
  useEffect(() => {
    if (cardId) {
      loadPublicVault(cardId);
    }
  }, [cardId, loadPublicVault]);

  // Handle PIN verification
  const handleUnlock = async (pin) => {
    setIsSubmittingCode(true);
    setCodeError(null);
    try {
      await unlockWithCode(pin);
      setShowUnlockAnimation(true);
    } catch (err) {
      setCodeError(err.message || "That doesn't seem to be the right key. Try again. ♡");
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const currentSibling = unlockedSibling || publicSibling;

  // Active recordings filtered
  const activeRecordings = recordings.filter((r) => r.isActive !== false);

  // Loading state for public info
  if (isLoadingPublic && !publicSibling) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-serif italic">Loading memory vault...</p>
      </div>
    );
  }

  // Not Found / Error State
  if (error && !publicSibling && !isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <HeartCrack className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-white mb-2">Vault Not Found</h2>
        <p className="text-slate-400 text-sm max-w-xs mb-6 leading-relaxed">
          {error || 'This memory vault link is invalid or may have been moved.'}
        </p>
        <button
          onClick={() => loadPublicVault(cardId)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0e] text-white flex flex-col justify-center overflow-hidden">
      {/* Background Media Synchronization Layer */}
      <BackgroundMedia
        recording={activeRecording}
        siblingCover={currentSibling?.coverImageUrl}
        isPlaying={isPlaying}
      />

      {/* Unlock Celebration Animation Overlay */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <UnlockOverlay
            sibling={currentSibling}
            onComplete={() => setShowUnlockAnimation(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content Router */}
      <main className="relative z-10 w-full flex-1 flex flex-col justify-center py-6">
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            /* STATE 1: Locked Vault - 6-Digit PIN Screen */
            <motion.div
              key="locked-pin-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SecretPinPad
                sibling={currentSibling || publicSibling}
                onUnlock={handleUnlock}
                error={codeError}
                isSubmitting={isSubmittingCode}
              />
            </motion.div>
          ) : activeRecordings.length === 0 ? (
            /* CASE A: 0 Songs -> Emotional Empty State */
            <motion.div
              key="case-a-empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <VaultEmptyState sibling={unlockedSibling} onLock={lockVault} />
            </motion.div>
          ) : activeRecordings.length === 1 ? (
            /* CASE B: Exactly 1 Song -> DIRECT MUSIC PLAYER (No selection screen!) */
            <motion.div
              key={`case-b-player-${activeRecordings[0]._id}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <MusicPlayer
                recording={activeRecordings[0]}
                sibling={unlockedSibling}
                recordingsCount={1}
                onBack={null} // No back button for single-song sibling
                onNext={null}
                onPrev={null}
                onLock={lockVault}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />
            </motion.div>
          ) : (
            /* CASE C: 2+ Songs -> Library Selection OR Player */
            <motion.div
              key={activeRecording ? `case-c-player-${activeRecording._id}` : 'case-c-grid'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              {activeRecording ? (
                /* Active Song in Player with "← Back to Memories" */
                <MusicPlayer
                  recording={activeRecording}
                  sibling={unlockedSibling}
                  recordingsCount={activeRecordings.length}
                  onBack={() => selectRecording(null)}
                  onNext={nextSong}
                  onPrev={prevSong}
                  onLock={lockVault}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                />
              ) : (
                /* Song Selection Library Grid */
                <SongGrid
                  recordings={activeRecordings}
                  sibling={unlockedSibling}
                  onSelectSong={(song) => selectRecording(song)}
                  onLock={lockVault}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
