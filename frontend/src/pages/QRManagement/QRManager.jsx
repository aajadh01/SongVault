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
  CreditCard,
  Loader2,
  Palette,
  Layers,
  CheckCircle2,
  Maximize2,
  ShieldCheck,
  Heart,
  Sparkles,
} from 'lucide-react';

export const QRManager = () => {
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSibling, setSelectedSibling] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Sticker Customization State
  const [topText, setTopText] = useState('OUR SONG ♡');
  const [bottomText, setBottomText] = useState('SCAN TO UNLOCK');
  const [theme, setTheme] = useState('lavender'); // 'lavender', 'white', 'dark', 'rose'
  const [layout, setLayout] = useState('canva-card-box'); // 'canva-card-box', 'id-card-stamp', 'card-print-large'
  const [transparentBg, setTransparentBg] = useState(true);
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
        transparentBg,
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `sibling-canva-badge-${selectedSibling.cardId}.png`;
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
    ? getDeterministicWaveHeights(selectedSibling.cardId, 16)
    : [];

  const publicUrl = selectedSibling
    ? `${window.location.origin}/s/${selectedSibling.cardId}`
    : '';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-rose-400" />
          <span>Canva Card Print & QR Studio</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Export high-scan **Sibling License Badges** custom-proportioned for Canva templates with giant, easily scannable QR codes.
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
          {/* Left Column: Sibling List & Selection (5 cols) */}
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
                        <QRCodeSVG value={sibUrl} size={48} level="L" marginSize={1} />
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

            {/* Standalone Square QR Exports */}
            {selectedSibling && (
              <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Standalone Full-Size Card QR
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">1024px High-Res</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Best for pasting directly into Photoshop/Canva card templates at 15mm-25mm size.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`/api/public/qr/${selectedSibling.cardId}?download=true&format=png`}
                    download
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Large PNG</span>
                  </a>

                  <a
                    href={`/api/public/qr/${selectedSibling.cardId}?download=true&format=svg`}
                    download
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Vector SVG</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Physical Card Print Studio (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {selectedSibling && (
              <>
                {/* Live Card Badge Preview Box */}
                <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-base font-serif font-bold text-white">
                        Canva Template Badge Preview
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Clean Centered (25mm High Scan)</span>
                    </div>
                  </div>

                  {/* The Physical Badge Preview */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="w-full max-w-xs space-y-3 select-none">
                      {layout === 'canva-card-box' ? (
                        /* CANVA CARD BOX (Clean Centered) */
                        <div className="space-y-3">
                          {/* Top Header */}
                          <div className="text-center font-sans font-black text-sm sm:text-base tracking-wider text-[#14162B] dark:text-white">
                            {topText.toUpperCase()}
                          </div>

                          {/* Soundwave Pill */}
                          <div className="w-full h-10 rounded-full px-3 flex items-center justify-between shadow bg-[#E6E9FD] text-[#14162B] border border-[#14162B]/10">
                            <div className="w-6 h-6 rounded-full bg-[#14162B] text-white flex items-center justify-center flex-shrink-0">
                              <Heart className="w-3 h-3 fill-current" />
                            </div>

                            <div className="flex-1 flex items-center justify-center gap-1 px-2 h-5">
                              {waveHeights.map((h, i) => (
                                <div
                                  key={i}
                                  className="w-1 rounded-full bg-[#14162B]"
                                  style={{ height: `${Math.max(25, h * 100)}%` }}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Large 25mm Scannable QR Code */}
                          <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-slate-300 flex items-center justify-center mx-auto w-44 h-44">
                            <QRCodeSVG value={publicUrl} size={150} level="L" marginSize={0} />
                          </div>

                          {/* Bottom Instruction */}
                          <div className="text-center font-sans font-bold text-xs tracking-wide text-[#14162B] dark:text-white pt-0.5">
                            <span>{bottomText.toUpperCase()}</span>
                            <span className="ml-1.5 inline-block text-sm">⤹</span>
                          </div>
                        </div>
                      ) : layout === 'id-card-stamp' ? (
                        /* ID CARD STAMP (Side-by-Side) */
                        <div className="space-y-2">
                          <div className="text-left font-sans font-black text-sm sm:text-base tracking-wider text-[#14162B] dark:text-white">
                            {topText.toUpperCase()}
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 h-14 rounded-full px-3 flex items-center justify-between shadow bg-[#E6E9FD] text-[#14162B] border border-[#14162B]/10">
                              <div className="w-8 h-8 rounded-full bg-[#14162B] text-white flex items-center justify-center flex-shrink-0">
                                <Heart className="w-4 h-4 fill-current" />
                              </div>

                              <div className="flex-1 flex items-center justify-center gap-1 px-2 h-8">
                                {waveHeights.map((h, i) => (
                                  <div
                                    key={i}
                                    className="w-1.5 rounded-full bg-[#14162B]"
                                    style={{ height: `${Math.max(25, h * 100)}%` }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="p-2 bg-white rounded-2xl shadow-xl border-2 border-slate-300 flex-shrink-0">
                              <QRCodeSVG value={publicUrl} size={76} level="L" marginSize={0} />
                            </div>
                          </div>

                          <div className="text-left font-sans font-bold text-xs tracking-wide text-[#14162B] dark:text-white pl-2 pt-1">
                            <span>{bottomText.toUpperCase()}</span>
                            <span className="ml-1.5 inline-block text-sm">⤹</span>
                          </div>
                        </div>
                      ) : (
                        /* HORIZONTAL CAPSULE */
                        <div className="space-y-2">
                          <div className="text-left font-sans font-black text-sm sm:text-base tracking-wider text-[#14162B] dark:text-white">
                            {topText.toUpperCase()}
                          </div>

                          <div className="w-full h-16 sm:h-20 rounded-full px-3 sm:px-4 flex items-center justify-between shadow bg-[#E6E9FD] text-[#14162B] border border-[#14162B]/10">
                            <div className="w-10 h-10 rounded-full bg-[#14162B] text-white flex items-center justify-center flex-shrink-0">
                              <Heart className="w-5 h-5 fill-current" />
                            </div>

                            <div className="flex-1 flex items-center justify-center gap-1.5 px-3 h-10">
                              {waveHeights.map((h, i) => (
                                <div
                                  key={i}
                                  className="w-1.5 rounded-full bg-[#14162B]"
                                  style={{ height: `${Math.max(18, h * 100)}%` }}
                                />
                              ))}
                            </div>

                            <div className="p-1.5 bg-white rounded-xl shadow border border-slate-300 flex-shrink-0">
                              <QRCodeSVG value={publicUrl} size={52} level="L" marginSize={0} />
                            </div>
                          </div>

                          <div className="text-center font-sans font-bold text-xs tracking-wide text-[#14162B] dark:text-white pt-1">
                            <span>{bottomText.toUpperCase()}</span>
                            <span className="ml-1.5 inline-block text-sm">⤹</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Print Customization Controls */}
                  <div className="space-y-4 pt-2 border-t border-white/5">
                    {/* Badge Layout Mode */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-rose-400" />
                        <span>Canva Template Layout</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => setLayout('canva-card-box')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                            layout === 'canva-card-box'
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${layout === 'canva-card-box' ? 'text-emerald-400' : 'opacity-0'}`} />
                          <span>Canva Free-Space Box (Default)</span>
                        </button>

                        <button
                          onClick={() => setLayout('id-card-stamp')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                            layout === 'id-card-stamp'
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${layout === 'id-card-stamp' ? 'text-rose-400' : 'opacity-0'}`} />
                          <span>Side-by-Side Stamp</span>
                        </button>

                        <button
                          onClick={() => setLayout('card-print-large')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                            layout === 'card-print-large'
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${layout === 'card-print-large' ? 'text-rose-400' : 'opacity-0'}`} />
                          <span>Horizontal Capsule</span>
                        </button>
                      </div>
                    </div>

                    {/* Transparent Background Option */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-rose-400" />
                        <div>
                          <p className="text-xs font-semibold text-white">Transparent PNG Background</p>
                          <p className="text-[11px] text-slate-400">Blends seamlessly onto your Canva card design</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={transparentBg}
                        onChange={(e) => setTransparentBg(e.target.checked)}
                        className="w-4 h-4 accent-rose-500 cursor-pointer"
                      />
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
                          placeholder="e.g. SCAN TO UNLOCK"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    {/* Primary Download Button */}
                    <div className="pt-2">
                      <button
                        onClick={handleDownloadSticker}
                        disabled={isGenerating}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-rose-500 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white font-bold text-sm shadow-[0_4px_25px_rgba(244,63,94,0.35)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating Canva Badge...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download Canva Free-Space Badge (Transparent 300 DPI PNG)</span>
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
