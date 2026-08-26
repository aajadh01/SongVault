import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BackgroundMedia = ({ recording, siblingCover, isPlaying }) => {
  const videoRef = useRef(null);
  const ambientVideoRef = useRef(null);

  const mediaType = recording?.backgroundMediaType || 'none';
  const videoUrl = recording?.backgroundVideoUrl;
  const imageUrl = recording?.backgroundImageUrl || recording?.coverImageUrl || siblingCover;

  // Synchronize video playback with audio play/pause state
  useEffect(() => {
    if (mediaType === 'video') {
      if (isPlaying) {
        if (videoRef.current) {
          videoRef.current.play().catch((err) => console.warn('Hero video play failed:', err));
        }
        if (ambientVideoRef.current) {
          ambientVideoRef.current.play().catch((err) => console.warn('Ambient video play failed:', err));
        }
      } else {
        if (videoRef.current) videoRef.current.pause();
        if (ambientVideoRef.current) ambientVideoRef.current.pause();
      }
    }
  }, [isPlaying, mediaType, videoUrl]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#0a0a0e]">
      <AnimatePresence mode="wait">
        {mediaType === 'video' && videoUrl ? (
          <motion.div
            key={`video-${recording?._id || videoUrl}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
          >
            {/* 1. Ambient Background Layer: Blurs & fills 100% of the screen (eliminates black bars for 4:3 videos) */}
            <video
              ref={ambientVideoRef}
              src={videoUrl}
              muted
              playsInline
              loop
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover filter blur-3xl scale-125 opacity-45 transform pointer-events-none"
            />

            {/* 2. Main Hero Video Layer: Preserves 4:3, 16:9, and 9:16 aspect ratios without cropping critical content */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoUrl}
                muted
                playsInline
                loop
                preload="auto"
                className="w-full h-full object-cover md:object-contain max-h-screen"
                style={{
                  // Ensures 4:3 videos maintain natural framing while filling vertical spaces elegantly
                  objectPosition: 'center center',
                }}
              />
            </div>

            {/* 3. Cinematic Atmospheric Vignette & Controls Gradient */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0a0a0e] via-[#0a0a0e]/40 to-[#0a0a0e]/65 pointer-events-none" />
            <div className="absolute inset-0 z-20 bg-black/25 backdrop-blur-[1px] pointer-events-none" />
          </motion.div>
        ) : mediaType === 'image' && imageUrl ? (
          <motion.div
            key={`image-${recording?._id || imageUrl}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
          >
            {/* Ambient Image Background */}
            <img
              src={imageUrl}
              alt="Memory Ambient"
              className="absolute inset-0 w-full h-full object-cover filter blur-2xl scale-125 opacity-40 transform pointer-events-none"
            />

            {/* Main Image */}
            <img
              src={imageUrl}
              alt="Memory Background"
              className="relative z-10 w-full h-full object-cover md:object-contain brightness-90 transform scale-100 transition-transform duration-1000"
            />

            {/* Atmospheric dark gradient */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0a0a0e] via-[#0a0a0e]/50 to-[#0a0a0e]/75 pointer-events-none" />
          </motion.div>
        ) : (
          <motion.div
            key="fallback-ambient"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full bg-[#0a0a0e]"
          >
            {/* Atmospheric glowing orbs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
