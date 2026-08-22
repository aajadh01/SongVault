import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../../config/api';
import {
  ArrowLeft,
  Save,
  Sparkles,
  RefreshCw,
  KeyRound,
  Shield,
  Upload,
  Heart,
  Loader2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';

export const SiblingForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    cardId: '',
    secretCode: '',
    hint: '',
    welcomeMessage: 'Some memories deserve their own little place. ♡',
    isActive: true,
    profileImageUrl: '',
    coverImageUrl: '',
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // If edit mode, fetch sibling details
  useEffect(() => {
    if (isEdit) {
      const fetchSibling = async () => {
        try {
          const res = await API.get(`/siblings/${id}`);
          if (res.data.success) {
            const s = res.data.sibling;
            setFormData({
              name: s.name || '',
              cardId: s.cardId || '',
              secretCode: '', // Leave blank unless updating
              hint: s.hint || '',
              welcomeMessage: s.welcomeMessage || '',
              isActive: s.isActive !== undefined ? s.isActive : true,
              profileImageUrl: s.profileImageUrl || '',
              coverImageUrl: s.coverImageUrl || '',
            });
          }
        } catch (err) {
          setError('Failed to load sibling data.');
        } finally {
          setLoading(false);
        }
      };
      fetchSibling();
    } else {
      // Auto-generate a card ID for new sibling
      generateCardId();
    }
  }, [id, isEdit]);

  const generateCardId = async () => {
    try {
      const prefix = formData.name ? formData.name.slice(0, 3) : '';
      const res = await API.get(`/siblings/generate-card-id?prefix=${prefix}`);
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, cardId: res.data.cardId }));
      }
    } catch (err) {
      console.error('Failed to generate card ID:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name.trim() || !formData.cardId.trim()) {
      setError('Sibling Name and Card ID are required.');
      return;
    }

    if (!isEdit && (!formData.secretCode || !/^\d{6}$/.test(formData.secretCode.trim()))) {
      setError('Please provide a valid 6-digit numeric secret code.');
      return;
    }

    if (isEdit && formData.secretCode && !/^\d{6}$/.test(formData.secretCode.trim())) {
      setError('Secret code must be exactly 6 digits.');
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('cardId', formData.cardId.trim().toUpperCase());
      if (formData.secretCode) {
        data.append('secretCode', formData.secretCode.trim());
      }
      data.append('hint', formData.hint.trim());
      data.append('welcomeMessage', formData.welcomeMessage.trim());
      data.append('isActive', formData.isActive);

      if (profileImageFile) {
        data.append('profileImage', profileImageFile);
      } else if (formData.profileImageUrl) {
        data.append('profileImageUrl', formData.profileImageUrl);
      }

      if (coverImageFile) {
        data.append('coverImage', coverImageFile);
      } else if (formData.coverImageUrl) {
        data.append('coverImageUrl', formData.coverImageUrl);
      }

      if (isEdit) {
        await API.put(`/siblings/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Sibling vault updated successfully!');
      } else {
        const res = await API.post('/siblings', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Sibling vault created successfully!');
        setTimeout(() => {
          navigate(`/admin/siblings/${res.data.sibling._id}/recordings`);
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save sibling vault.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/siblings"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Siblings</span>
        </Link>
        <span className="text-xs font-mono text-slate-500">
          {isEdit ? `ID: ${formData.cardId}` : 'NEW VAULT'}
        </span>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            {isEdit ? `Edit Sibling: ${formData.name}` : 'Create Sibling Memory Vault'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Configure the physical card identifiers, secret PIN code, and vault branding.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium mb-6">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name & Card ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Sibling Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Thrailokya, Aajadh"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Unique Card ID *
                </label>
                <button
                  type="button"
                  onClick={generateCardId}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Auto-Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.cardId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cardId: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
                  })
                }
                placeholder="e.g. THR7X9"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-rose-300 font-mono font-bold tracking-wider text-sm focus:outline-none focus:border-rose-500 transition-colors uppercase"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Public URL: {window.location.origin}/s/{formData.cardId || '...'}
              </p>
            </div>
          </div>

          {/* Row 2: 6-Digit Secret Code & Hint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>6-Digit Secret Code {isEdit ? '(Leave blank to keep existing)' : '*'}</span>
              </label>
              <input
                type="password"
                maxLength={6}
                value={formData.secretCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    secretCode: e.target.value.replace(/\D/g, ''),
                  })
                }
                placeholder={isEdit ? '••••••' : 'e.g. 060705'}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-rose-500/30 text-white font-mono text-center text-lg tracking-widest focus:outline-none focus:border-rose-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Hashed with bcrypt before storage. Never stored plaintext.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Secret Code Hint (Publicly Shown)</span>
              </label>
              <input
                type="text"
                value={formData.hint}
                onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                placeholder="e.g. Where two birthdays become one. ❤️"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Printed on the physical card or shown on the unlock screen.
              </p>
            </div>
          </div>

          {/* Row 3: Welcome Message */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Vault Welcome Message
            </label>
            <textarea
              rows={2}
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
              placeholder="e.g. Some memories deserve their own little place. ♡"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Row 4: Cover Image & Profile Image Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Cover Image (Artwork / Landscape)
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImageFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                />
                <input
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  placeholder="Or enter image URL (https://...)"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Profile Image (Avatar / Photo)
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImageFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                />
                <input
                  type="url"
                  value={formData.profileImageUrl}
                  onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                  placeholder="Or enter image URL (https://...)"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded-lg text-rose-500 focus:ring-rose-500 bg-black/40 border-white/10 cursor-pointer accent-rose-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-300 cursor-pointer">
              Active Vault (Uncheck to temporarily deactivate access)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Link
              to="/admin/siblings"
              className="px-5 py-2.5 rounded-xl glass-card hover:bg-white/10 text-slate-300 text-sm font-medium transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-sm font-semibold shadow-[0_4px_20px_rgba(244,63,94,0.35)] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Vault...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Update Sibling Vault' : 'Create & Add Recordings'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
