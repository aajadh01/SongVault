import React, { useEffect, useState } from 'react';
import API from '../../config/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  generateSoundwaveStickerPNG,
  getDeterministicWaveHeights,
} from '../../utils/stickerGenerator';
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Heart,
  Sparkles,
  CreditCard,
  Printer,
  Loader2,
  Sliders,
  Palette,
  Layers,
  Wand2,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';

export const QRManager = () => {
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSibling, setSelectedSibling] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Sticker Customization State
  const [topText, setTopText] = useState('OUR SONG ♡');
  const [bottomText, setBottomText] = useState('SCAN THE CODE');
  const [theme, setTheme] = useState('lavender'); // 'lavender', 'white', 'dark', 'rose'
  const [layout, setLayout] = useState('qr-right'); // 'qr-right', 'qr-left-vinyl'
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchSiblings = async () => {
      try {
        const res = await API.get('/siblings');
        if (res.data.success) {
          setSiblings(res.data.siblings);
          if (res.data.siblings.length > 0) {
            setSelectedSibling(res.data.siblings[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load siblings for QR:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSiblings();
  }, []);

  const handleCopyUrl = (cardId) => {
    const url = `${window.location.origin}/s/${cardId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cardId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSticker = async () => {
    if (!selectedSibling) return;
    setIsGenerating(true);
    try {
      const publicUrl = `${window.location.origin}/s/${selectedSibling.cardId}`;
      const dataUrl = await generateSoundwaveStickerPNG({
        topText,
        bottomText,
        cardId: selectedSibling.cardId,
        publicUrl,
        theme,
        layout,
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `soundwave-sticker-${selectedSibling.cardId}-${theme}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download sticker error:', err);
      alert('Failed to generate sticker image.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  const waveHeights = selectedSibling
    ? getDeterministicWaveHeights(selectedSibling.cardId, layout === 'qr-left-vinyl' ? 24 : 18)
    : [];

  const publicUrl = selectedSibling
    ? `${window.location.origin}/s/${selectedSibling.cardId}`
    : '';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
          <QrCode className="w-7 h-7 text-rose-400" />
          <span>Soundwave Sticker & QR Studio</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Generate scannable **Soundwave Memory Stickers** (*"OUR SONG ♡"*) and print-ready QR license cards.
        </p>
      </div>

      {siblings.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/10">
          <QrCode className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Sibling Vaults Found</h3>
          <p className="text-slate-400 text-sm">
            Create a sibling first to automatically generate their unique Soundwave stickers and QR codes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sibling Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Select Sibling ({siblings.length})</span>
            </h2>

            <div className="space-y-3">
              {siblings.map((sib) => {
                const isSelected = selectedSibling?._id === sib._id;
                const sibUrl = `${window.location.origin}/s/${sib.cardId}`;

                return (
                  <div
                    key={sib._id}
                    onClick={() => setSelectedSibling(sib)}
                    className={`glass-card rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-rose-500/60 bg-rose-500/[0.08] shadow-[0_0_20px_rgba(244,63,94,0.18)]'
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 bg-white rounded-xl shadow flex-shrink-0">
                        <QRCodeSVG value={sibUrl} size={48} level="H" marginSize={1} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">{sib.name}</h3>
                          <span className="font-mono text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                            {sib.cardId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {sib.hint ? `"${sib.hint}"` : `${sib.recordingCount || 0} Songs`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(sib.cardId);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex-shrink-0"
                      title="Copy URL"
                    >
                      {copiedId === sib.cardId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Standard QR Code Quick Downloads */}
            {selectedSibling && (
              <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-3 pt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Standard Full-Card QR Exports
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`/api/public/qr/${selectedSibling.cardId}?download=true&format=png`}
                    download
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Square PNG</span>
                  </a>

                  <a
                    href={`/api/public/qr/${selectedSibling.cardId}?download=true&format=svg`}
                    download
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Square SVG</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Scannable Soundwave Sticker Studio (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {selectedSibling && (
              <>
                {/* Live Sticker Preview Box */}
                <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-rose-400" />
                      <h3 className="text-base font-serif font-bold text-white">
                        Scannable Soundwave Sticker Preview
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Smartphone className="w-3 h-3" />
                      <span>Phone Camera Scannable</span>
                    </div>
                  </div>

                  {/* The Exact Aesthetic Soundwave Sticker Card */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="w-full max-w-lg space-y-2 select-none">
                      {/* Top Header ("OUR SONG ♡") */}
                      <div
                        className={`text-left font-sans font-black text-sm sm:text-base tracking-wider ${
                          theme === 'dark'
                            ? 'text-white'
                            : theme === 'rose'
                            ? 'text-rose-600'
                            : theme === 'white'
                            ? 'text-slate-900'
                            : 'text-[#14162B]'
                        }`}
                      >
                        {topText.toUpperCase()}
                      </div>

                      {/* Rounded Capsule Bar */}
                      <div
                        className={`w-full h-14 sm:h-16 rounded-full px-3 sm:px-4 flex items-center justify-between shadow-lg transition-all ${
                          theme === 'dark'
                            ? 'bg-[#181824] text-white border border-white/10'
                            : theme === 'rose'
                            ? 'bg-rose-50 text-rose-600'
                            : theme === 'white'
                            ? 'bg-white text-black border border-slate-200 shadow-md'
                            : 'bg-[#E8EAFD] text-[#14162B]'
                        }`}
                      >
                        {layout === 'qr-left-vinyl' ? (
                          <>
                            {/* Left Circular Scannable QR */}
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white shadow flex-shrink-0 p-0.5 border border-white/20">
                              <QRCodeSVG value={publicUrl} size={40} level="H" marginSize={0} />
                            </div>

                            {/* Soundwave Bars across */}
                            <div className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-3 h-8">
                              {waveHeights.map((h, i) => (
                                <div
                                  key={i}
                                  className={`w-1 sm:w-1.5 rounded-full transition-all ${
                                    theme === 'dark'
                                      ? 'bg-white'
                                      : theme === 'rose'
                                      ? 'bg-rose-600'
                                      : theme === 'white'
                                      ? 'bg-black'
                                      : 'bg-[#14162B]'
                                  }`}
                                  style={{ height: `${Math.max(16, h * 100)}%` }}
                                />
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Left Heart Icon */}
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                theme === 'dark'
                                  ? 'bg-white text-black'
                                  : theme === 'rose'
                                  ? 'bg-rose-600 text-white'
                                  : theme === 'white'
                                  ? 'bg-black text-white'
                                  : 'bg-[#14162B] text-white'
                              }`}
                            >
                              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                            </div>

                            {/* Center Soundwave Bars */}
                            <div className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-3 h-8">
                              {waveHeights.map((h, i) => (
                                <div
                                  key={i}
                                  className={`w-1 sm:w-1.5 rounded-full transition-all ${
                                    theme === 'dark'
                                      ? 'bg-white'
                                      : theme === 'rose'
                                      ? 'bg-rose-600'
                                      : theme === 'white'
                                      ? 'bg-black'
                                      : 'bg-[#14162B]'
                                  }`}
                                  style={{ height: `${Math.max(16, h * 100)}%` }}
                                />
                              ))}
                            </div>

                            {/* Right Scannable QR Tag */}
                            <div className="p-1 bg-white rounded-lg shadow flex-shrink-0">
                              <QRCodeSVG value={publicUrl} size={36} level="H" marginSize={0} />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Bottom Instruction ("SCAN THE CODE ⤹") */}
                      <div
                        className={`text-center font-sans font-bold text-xs sm:text-sm tracking-wide pt-1 ${
                          theme === 'dark'
                            ? 'text-white'
                            : theme === 'rose'
                            ? 'text-rose-600'
                            : theme === 'white'
                            ? 'text-slate-900'
                            : 'text-[#14162B]'
                        }`}
                      >
                        <span>{bottomText.toUpperCase()}</span>
                        <span className="ml-1.5 inline-block transform text-sm sm:text-base">⤹</span>
                      </div>
                    </div>
                  </div>

                  {/* Customization Controls */}
                  <div className="space-y-4 pt-2 border-t border-white/5">
                    {/* Style / Layout Options */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-rose-400" />
                        <span>Scannable Badge Layout</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setLayout('qr-right')}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                            layout === 'qr-right'
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${layout === 'qr-right' ? 'text-rose-400' : 'opacity-0'}`} />
                          <span>Heart Icon + Soundwave + QR (Right)</span>
                        </button>

                        <button
                          onClick={() => setLayout('qr-left-vinyl')}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                            layout === 'qr-left-vinyl'
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${layout === 'qr-left-vinyl' ? 'text-rose-400' : 'opacity-0'}`} />
                          <span>Vinyl QR (Left) + Soundwaves</span>
                        </button>
                      </div>
                    </div>

                    {/* Top & Bottom Text Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Top Title
                        </label>
                        <input
                          type="text"
                          value={topText}
                          onChange={(e) => setTopText(e.target.value)}
                          placeholder="e.g. OUR SONG ♡"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Bottom Instruction
                        </label>
                        <input
                          type="text"
                          value={bottomText}
                          onChange={(e) => setBottomText(e.target.value)}
                          placeholder="e.g. SCAN THE CODE"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    {/* Color Theme Selector */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <Palette className="w-3 h-3 text-rose-400" />
                        <span>Color Theme</span>
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'lavender', label: 'Lavender (Classic)', bg: 'bg-[#E8EAFD] text-[#14162B]' },
                          { id: 'white', label: 'Crisp White', bg: 'bg-white text-black' },
                          { id: 'dark', label: 'Midnight Dark', bg: 'bg-[#181824] text-white' },
                          { id: 'rose', label: 'Rose Pink', bg: 'bg-rose-100 text-rose-600' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${t.bg} ${
                              theme === t.id
                                ? 'ring-2 ring-rose-500 border-transparent shadow-md'
                                : 'opacity-70 hover:opacity-100 border-white/10'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary Download Button */}
                    <div className="pt-2">
                      <button
                        onClick={handleDownloadSticker}
                        disabled={isGenerating}
                        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-sm shadow-[0_4px_20px_rgba(244,63,94,0.35)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating Ultra High-Res Sticker...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download Scannable Soundwave Sticker (300 DPI PNG)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
