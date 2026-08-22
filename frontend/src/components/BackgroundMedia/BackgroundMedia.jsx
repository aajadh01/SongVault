import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BackgroundMedia = ({ recording, siblingCover, isPlaying }) => {
  const videoRef = useRef(null);

  const mediaType = recording?.backgroundMediaType || 'none';
  const videoUrl = recording?.backgroundVideoUrl;
  const imageUrl = recording?.backgroundImageUrl || recording?.coverImageUrl || siblingCover;

  // Synchronize video playback with audio play/pause state
  useEffect(() => {
    if (mediaType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((err) => {
          console.warn('Background video play failed:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, mediaType, videoUrl]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {mediaType === 'video' && videoUrl ? (
          <motion.div
            key={`video-${recording?._id || videoUrl}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            <video
              ref={videoRef}
              src={videoUrl}
              muted
              playsInline
              loop
              preload="auto"
              className="w-full h-full object-cover transform scale-[1.03]"
            />
            {/* Cinematic layered gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-[#0a0a0e]/60 to-[#0a0a0e]/80" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </motion.div>
        ) : mediaType === 'image' && imageUrl ? (
          <motion.div
            key={`image-${recording?._id || imageUrl}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={imageUrl}
              alt="Memory Background"
              className="w-full h-full object-cover filter blur-[2px] brightness-75 transform scale-105 transition-transform duration-1000"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-[#0a0a0e]/70 to-[#0a0a0e]/85" />
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
