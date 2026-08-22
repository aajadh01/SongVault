import React from 'react';
import { motion } from 'framer-motion';
import { Play, Disc3, Video, Image as ImageIcon, Music, Lock, Heart, Clock } from 'lucide-react';

export const SongGrid = ({ recordings, sibling, onSelectSong, onLock }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-8 flex flex-col min-h-screen justify-between">
      <div>
        {/* Header Bar */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{sibling?.name || 'Sibling'} Vault</span>
          </div>

          <button
            onClick={onLock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card hover:bg-rose-500/20 hover:text-rose-300 text-xs font-medium text-slate-400 transition-all"
            title="Lock Vault"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </header>

        {/* Title Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-rose-400 text-xs font-bold tracking-widest uppercase mb-2"
          >
            <span>♡ Collection of Memories ♡</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-2"
          >
            Choose a Memory
          </motion.h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Select any song below to begin your synchronized audiovisual journey.
          </p>
        </div>

        {/* Songs List */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="space-y-3"
        >
          {recordings.map((recording, index) => {
            const cover = recording.coverImageUrl || sibling?.coverImageUrl;
            return (
              <motion.div
                key={recording._id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectSong(recording)}
                className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl glass-card hover:glass-panel-glow transition-all duration-300 cursor-pointer overflow-hidden border border-white/5 hover:border-rose-500/40 shadow-lg"
              >
                {/* Index / Number */}
                <span className="text-xs font-mono text-slate-500 font-bold w-6 text-center group-hover:text-rose-400 transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
                </span>

                {/* Cover Thumbnail */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 mx-3 border border-white/10">
                  {cover ? (
                    <img
                      src={cover}
                      alt={recording.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Music className="w-6 h-6 text-rose-400" />
                    </div>
                  )}

                  {/* Hover play overlay */}
                  <div className="absolute inset-0 bg-rose-600/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                  </div>
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="text-sm sm:text-base font-semibold text-white truncate group-hover:text-rose-300 transition-colors">
                    {recording.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {recording.backgroundMediaType === 'video' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        <Video className="w-2.5 h-2.5" /> Video BG
                      </span>
                    )}
                    {recording.backgroundMediaType === 'image' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        <ImageIcon className="w-2.5 h-2.5" /> Photo BG
                      </span>
                    )}
                    {recording.description && (
                      <span className="text-xs text-slate-400 truncate">
                        {recording.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Duration & Play icon */}
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-white flex-shrink-0">
                  {recording.duration > 0 && (
                    <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                      {formatDuration(recording.duration)}
                    </span>
                  )}
                  <div className="w-9 h-9 rounded-full bg-white/[0.05] group-hover:bg-rose-500 text-slate-300 group-hover:text-white flex items-center justify-center transition-colors shadow">
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Footer message */}
      <footer className="mt-8 text-center text-xs text-slate-500 font-serif italic pb-4">
        "Some moments are forever immortalized in song." ♡
      </footer>
    </div>
  );
};
