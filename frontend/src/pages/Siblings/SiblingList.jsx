import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../config/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users,
  Plus,
  Search,
  Music,
  QrCode,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Video,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  X,
  Download,
  Copy,
  Check,
} from 'lucide-react';

export const SiblingList = () => {
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedQrSibling, setSelectedQrSibling] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  const fetchSiblings = async () => {
    try {
      const res = await API.get('/siblings');
      if (res.data.success) {
        setSiblings(res.data.siblings);
      }
    } catch (err) {
      console.error('Failed to fetch siblings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiblings();
  }, []);

  const handleDelete = async (sibling) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${sibling.name}'s vault (${sibling.cardId})? This will permanently delete all associated recordings.`
      )
    ) {
      return;
    }

    setIsDeleting(sibling._id);
    try {
      const res = await API.delete(`/siblings/${sibling._id}`);
      if (res.data.success) {
        setSiblings(siblings.filter((s) => s._id !== sibling._id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete sibling.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCopyUrl = (cardId) => {
    const url = `${window.location.origin}/s/${cardId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cardId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSiblings = siblings.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.cardId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Siblings Vaults
          </h1>
          <p className="text-slate-400 text-sm">
            Manage individual memory vaults and physical card configurations.
          </p>
        </div>

        <Link
          to="/admin/siblings/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-medium text-sm shadow-[0_4px_15px_rgba(244,63,94,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Sibling</span>
        </Link>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Sibling Name or Card ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12121a] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-colors"
        />
      </div>

      {/* Siblings Grid / Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : filteredSiblings.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl border border-white/5">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">No Siblings Found</h3>
          <p className="text-slate-400 text-sm mb-4">
            {search ? 'No matches for your search query.' : 'Create your first sibling memory vault.'}
          </p>
          {!search && (
            <Link
              to="/admin/siblings/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Sibling
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSiblings.map((sibling) => (
            <div
              key={sibling._id}
              className="glass-card rounded-3xl p-5 border border-white/10 flex flex-col justify-between hover:border-rose-500/30 transition-all duration-300 shadow-xl relative overflow-hidden group"
            >
              <div>
                {/* Sibling Card Top */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                      {sibling.coverImageUrl || sibling.profileImageUrl ? (
                        <img
                          src={sibling.coverImageUrl || sibling.profileImageUrl}
                          alt={sibling.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {sibling.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          {sibling.cardId}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            sibling.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {sibling.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* QR quick button */}
                  <button
                    onClick={() => setSelectedQrSibling(sibling)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors"
                    title="View QR Code"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>

                {/* Hint & Description */}
                {sibling.hint && (
                  <div className="bg-white/[0.02] rounded-xl p-2.5 mb-4 border border-white/5 text-xs text-slate-300 font-serif italic line-clamp-2">
                    Hint: "{sibling.hint}"
                  </div>
                )}

                {/* Recordings Metric Badge */}
                <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-black/30 text-xs text-slate-400 mb-4 font-medium">
                  <div className="flex items-center gap-1 text-white">
                    <Music className="w-3.5 h-3.5 text-rose-400" />
                    <span>{sibling.recordingCount || 0} Songs</span>
                  </div>
                  {sibling.videoCount > 0 && (
                    <div className="flex items-center gap-1 text-purple-300">
                      <Video className="w-3.5 h-3.5 text-purple-400" />
                      <span>{sibling.videoCount} Video</span>
                    </div>
                  )}
                  {sibling.imageCount > 0 && (
                    <div className="flex items-center gap-1 text-blue-300">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{sibling.imageCount} Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/admin/siblings/${sibling._id}/recordings`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-all"
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Recordings</span>
                  </Link>
                  <Link
                    to={`/admin/siblings/${sibling._id}/edit`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Vault</span>
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={`/s/${sibling.cardId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Public Vault</span>
                  </a>

                  <button
                    onClick={() => handleDelete(sibling)}
                    disabled={isDeleting === sibling._id}
                    className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick QR Code Modal */}
      {selectedQrSibling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-white/10 relative text-center">
            <button
              onClick={() => setSelectedQrSibling(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-serif mb-1">
              {selectedQrSibling.name}'s QR Code
            </h3>
            <p className="text-xs text-rose-400 font-mono mb-4">
              Card ID: {selectedQrSibling.cardId}
            </p>

            {/* QR SVG Preview with proper quiet zone and high contrast */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl mb-4">
              <QRCodeSVG
                value={`${window.location.origin}/s/${selectedQrSibling.cardId}`}
                size={200}
                level="H"
                marginSize={2}
              />
            </div>

            <div className="text-xs text-slate-400 break-all mb-5 bg-black/40 p-2.5 rounded-xl font-mono">
              {`${window.location.origin}/s/${selectedQrSibling.cardId}`}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCopyUrl(selectedQrSibling.cardId)}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                {copiedId === selectedQrSibling.cardId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <a
                href={`/api/public/qr/${selectedQrSibling.cardId}?download=true&format=png`}
                download
                className="py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
