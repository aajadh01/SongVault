import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Heart,
  MessageCircleHeart,
  ArrowLeft,
  Lock,
  Music,
  Disc3,
  Sparkles,
} from 'lucide-react';

export const MusicPlayer = ({
  recording,
  sibling,
  recordingsCount = 1,
  onBack,
  onNext,
  onPrev,
  onLock,
  isPlaying,
  setIsPlaying,
}) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recording?.duration || 0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [audioError, setAudioError] = useState(null);

  // Format time helpers (mm:ss)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds === null) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reset audio when recording changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setAudioError(null);
      audioRef.current.load();
    }
  }, [recording?.audioUrl]);

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Audio play failed:', err);
          setIsPlaying(false);
          setIsLoading(false);
          setAudioError('Failed to play audio. Tap again to retry.');
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (isLooping) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (recordingsCount > 1 && onNext) {
      onNext();
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const seekTime = Number(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const coverImage = recording?.coverImageUrl || sibling?.coverImageUrl;

  return (
    <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-6 flex flex-col items-center min-h-[90vh] justify-between">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={recording?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          setAudioError('Unable to stream this audio track.');
        }}
        preload="metadata"
      />

      {/* Top Bar Navigation */}
      <header className="w-full flex items-center justify-between pt-2 pb-4">
        {recordingsCount > 1 ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full glass-card hover:bg-white/10 text-xs sm:text-sm font-medium text-slate-300 transition-all active:scale-95"
            aria-label="Back to Memories"
          >
            <ArrowLeft className="w-4 h-4 text-rose-400" />
            <span>Memories</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold tracking-wider uppercase">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{sibling?.name || 'Vault'}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {recording?.personalMessage && (
            <button
              onClick={() => setShowMessage(!showMessage)}
              className={`p-2.5 rounded-full glass-card transition-all ${
                showMessage ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'text-slate-300 hover:text-white'
              }`}
              title="Personal Message"
            >
              <MessageCircleHeart className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onLock}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full glass-card hover:bg-rose-500/20 hover:text-rose-300 text-xs font-medium text-slate-400 transition-all"
            title="Lock Memory Vault"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Center Stage: Artwork & Metadata */}
      <div className="w-full flex flex-col items-center my-auto py-4">
        {/* Vinyl / Cover Artwork with Ambient Glow */}
        <motion.div
          animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="relative w-64 h-64 sm:w-72 sm:h-72 mb-6 group"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-rose-500/30 via-pink-500/20 to-purple-600/30 blur-2xl group-hover:blur-3xl transition-all duration-700" />

          <div className="relative w-full h-full rounded-3xl overflow-hidden glass-panel-glow border-2 border-white/10 shadow-2xl flex items-center justify-center bg-black/40">
            {coverImage ? (
              <img
                src={coverImage}
                alt={recording?.title || 'Song Cover'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <Disc3 className={`w-20 h-20 text-rose-400/80 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                <span className="text-xs uppercase tracking-widest mt-2 text-slate-400">Sibling Vault</span>
              </div>
            )}

            {/* Media Type Badge Indicator */}
            {recording?.backgroundMediaType === 'video' && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-rose-300 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-rose-400" />
                <span>Motion BG</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Track Title & Sibling Name */}
        <div className="text-center px-4 max-w-sm">
          <div className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-1 flex items-center justify-center gap-1.5">
            <Music className="w-3.5 h-3.5" />
            <span>Our Memory Song</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight line-clamp-1 mb-1">
            {recording?.title || 'Untitled Recording'}
          </h2>

          {recording?.description ? (
            <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
              {recording.description}
            </p>
          ) : (
            <p className="text-slate-400 text-xs italic">
              {sibling?.welcomeMessage || 'A special moment in time.'}
            </p>
          )}
        </div>

        {/* Personal Message Card Drawer */}
        <AnimatePresence>
          {showMessage && recording?.personalMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="w-full mt-4 glass-card rounded-2xl p-4 border border-rose-500/30 text-center relative overflow-hidden"
            >
              <div className="flex items-center justify-center gap-1 text-xs text-rose-400 font-semibold uppercase tracking-wider mb-1">
                <Heart className="w-3 h-3 fill-rose-500" />
                <span>A Personal Note</span>
              </div>
              <p className="text-slate-200 text-sm font-serif italic leading-relaxed">
                "{recording.personalMessage}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Feedback */}
        {audioError && (
          <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
            {audioError}
          </div>
        )}
      </div>

      {/* Bottom Controls Area */}
      <div className="w-full glass-panel rounded-3xl p-5 sm:p-6 backdrop-blur-2xl shadow-2xl border border-white/10 mt-4">
        {/* Scrubber Progress Bar */}
        <div className="w-full mb-4">
          <div className="relative flex items-center group cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none"
              style={{
                background: `linear-gradient(to right, #f43f5e ${progressPercentage}%, rgba(255, 255, 255, 0.1) ${progressPercentage}%)`,
              }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1.5 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Action Buttons */}
        <div className="flex items-center justify-between w-full">
          {/* Loop / Replay Toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-full transition-colors ${
              isLooping ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title={isLooping ? 'Looping enabled' : 'Enable loop'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Previous Track (if multiple songs) */}
          <button
            onClick={onPrev}
            disabled={recordingsCount <= 1}
            className={`p-2.5 rounded-full transition-colors ${
              recordingsCount > 1 ? 'text-slate-300 hover:text-white active:scale-95' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Previous Memory"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Primary Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all duration-300 transform active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white translate-x-0.5" />
            )}
          </button>

          {/* Next Track (if multiple songs) */}
          <button
            onClick={onNext}
            disabled={recordingsCount <= 1}
            className={`p-2.5 rounded-full transition-colors ${
              recordingsCount > 1 ? 'text-slate-300 hover:text-white active:scale-95' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Next Memory"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Volume / Mute Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-14 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500 hidden sm:block"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
