import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../config/api';
import {
  Music,
  Plus,
  ArrowLeft,
  Video,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Play,
  Pause,
  Save,
  X,
  Upload,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  MessageCircleHeart,
  Volume2,
} from 'lucide-react';

export const RecordingManager = () => {
  const { id: siblingId } = useParams();

  const [sibling, setSibling] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecording, setEditingRecording] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [backgroundMediaType, setBackgroundMediaType] = useState('none'); // 'video' | 'image' | 'none'
  const [description, setDescription] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // URLs or Files
  const [audioUrl, setAudioUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');

  const [audioFile, setAudioFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [backgroundVideoFile, setBackgroundVideoFile] = useState(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // In-line audio preview
  const [previewAudio, setPreviewAudio] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  const fetchData = async () => {
    try {
      const [sibRes, recRes] = await Promise.all([
        API.get(`/siblings/${siblingId}`),
        API.get(`/siblings/${siblingId}/recordings`),
      ]);

      if (sibRes.data.success) setSibling(sibRes.data.sibling);
      if (recRes.data.success) setRecordings(recRes.data.recordings);
    } catch (err) {
      console.error('Failed to load sibling recordings:', err);
      setError('Failed to load recording vault.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [siblingId]);

  const openCreateModal = () => {
    setEditingRecording(null);
    setTitle('');
    setBackgroundMediaType('none');
    setDescription('');
    setPersonalMessage('');
    setLyrics('');
    setOrder(recordings.length + 1);
    setIsActive(true);
    setAudioUrl('');
    setCoverImageUrl('');
    setBackgroundVideoUrl('');
    setBackgroundImageUrl('');
    setAudioFile(null);
    setCoverImageFile(null);
    setBackgroundVideoFile(null);
    setBackgroundImageFile(null);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rec) => {
    setEditingRecording(rec);
    setTitle(rec.title || '');
    setBackgroundMediaType(rec.backgroundMediaType || 'none');
    setDescription(rec.description || '');
    setPersonalMessage(rec.personalMessage || '');
    setLyrics(rec.lyrics || '');
    setOrder(rec.order !== undefined ? rec.order : 0);
    setIsActive(rec.isActive !== undefined ? rec.isActive : true);
    setAudioUrl(rec.audioUrl || '');
    setCoverImageUrl(rec.coverImageUrl || '');
    setBackgroundVideoUrl(rec.backgroundVideoUrl || '');
    setBackgroundImageUrl(rec.backgroundImageUrl || '');
    setAudioFile(null);
    setCoverImageFile(null);
    setBackgroundVideoFile(null);
    setBackgroundImageFile(null);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleSaveRecording = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a song title.');
      return;
    }

    if (!editingRecording && !audioFile && !audioUrl.trim()) {
      setError('Please upload an audio file or provide an audio URL.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('title', title.trim());
      data.append('backgroundMediaType', backgroundMediaType);
      data.append('description', description.trim());
      data.append('personalMessage', personalMessage.trim());
      data.append('lyrics', lyrics.trim());
      data.append('order', order);
      data.append('isActive', isActive);

      // Files or URLs
      if (audioFile) data.append('audio', audioFile);
      else if (audioUrl) data.append('audioUrl', audioUrl.trim());

      if (coverImageFile) data.append('coverImage', coverImageFile);
      else if (coverImageUrl) data.append('coverImageUrl', coverImageUrl.trim());

      if (backgroundMediaType === 'video') {
        if (backgroundVideoFile) data.append('backgroundVideo', backgroundVideoFile);
        else if (backgroundVideoUrl) data.append('backgroundVideoUrl', backgroundVideoUrl.trim());
      } else if (backgroundMediaType === 'image') {
        if (backgroundImageFile) data.append('backgroundImage', backgroundImageFile);
        else if (backgroundImageUrl) data.append('backgroundImageUrl', backgroundImageUrl.trim());
      }

      if (editingRecording) {
        await API.put(`/recordings/${editingRecording._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Recording updated successfully!');
      } else {
        await API.post(`/siblings/${siblingId}/recordings`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Recording added to vault!');
      }

      await fetchData();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save recording.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecording = async (recording) => {
    if (!window.confirm(`Are you sure you want to delete "${recording.title}"?`)) {
      return;
    }

    try {
      const res = await API.delete(`/recordings/${recording._id}`);
      if (res.data.success) {
        setRecordings(recordings.filter((r) => r._id !== recording._id));
      }
    } catch (err) {
      alert('Failed to delete recording.');
    }
  };

  const togglePreview = (rec) => {
    if (previewAudio === rec._id) {
      audioElement?.pause();
      setPreviewAudio(null);
    } else {
      if (audioElement) audioElement.pause();
      const audio = new Audio(rec.audioUrl);
      audio.play();
      audio.onended = () => setPreviewAudio(null);
      setAudioElement(audio);
      setPreviewAudio(rec._id);
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/admin/siblings"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Siblings</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
            <span>{sibling?.name}'s Recordings</span>
            <span className="text-xs font-mono font-normal text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              {sibling?.cardId}
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Add songs and configure individual background videos, images, and personal messages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/s/${sibling?.cardId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-card hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
            <span>Test Public Vault</span>
          </a>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-semibold text-xs shadow-[0_4px_15px_rgba(244,63,94,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recording</span>
          </button>
        </div>
      </div>

      {/* Dynamic Flow Notice Badge */}
      <div className="glass-card rounded-2xl p-4 border border-white/5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>
            <strong>Dynamic Flow Status:</strong>{' '}
            {recordings.length === 0 && '0 Songs (Empty State Screen)'}
            {recordings.length === 1 && '1 Song (Direct Music Player Auto-Open)'}
            {recordings.length >= 2 && `${recordings.length} Songs (Song Selection Library Grid)`}
          </span>
        </div>
        <span className="font-mono text-slate-500 hidden sm:inline">
          Automatic Database Routing
        </span>
      </div>

      {/* Recordings List */}
      {recordings.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/10">
          <Music className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Recordings Yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-5">
            This sibling vault currently has zero songs. When unlocked, it will show the emotional empty state until you add songs.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Recording</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((rec, index) => {
            const cover = rec.coverImageUrl || sibling?.coverImageUrl;
            return (
              <div
                key={rec._id}
                className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-rose-500/30 transition-all shadow-md"
              >
                <div className="flex items-center gap-3">
                  {/* Track Number */}
                  <span className="text-xs font-mono font-bold text-slate-500 w-5 text-center">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>

                  {/* Play preview & Cover */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/50 border border-white/10 flex-shrink-0 group">
                    {cover ? (
                      <img src={cover} alt={rec.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Music className="w-5 h-5 text-rose-400" />
                      </div>
                    )}
                    <button
                      onClick={() => togglePreview(rec)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      {previewAudio === rec._id ? (
                        <Pause className="w-4 h-4 text-rose-400 fill-rose-400" />
                      ) : (
                        <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Song Metadata */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white">{rec.title}</h3>
                      {!rec.isActive && (
                        <span className="text-[10px] bg-slate-500/20 text-slate-400 px-1.5 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {rec.backgroundMediaType === 'video' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                          <Video className="w-2.5 h-2.5" /> Synchronized Video
                        </span>
                      ) : rec.backgroundMediaType === 'image' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                          <ImageIcon className="w-2.5 h-2.5" /> Atmospheric Image
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Ambient Fallback BG
                        </span>
                      )}

                      {rec.personalMessage && (
                        <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                          <MessageCircleHeart className="w-3 h-3" /> Note
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => togglePreview(rec)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    title="Audio Preview"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openEditModal(rec)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors"
                    title="Edit Song"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteRecording(rec)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Song"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Recording Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/10 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold text-white tracking-tight">
                {editingRecording ? `Edit Recording: ${editingRecording.title}` : 'Add Recording to Vault'}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Every recording independently controls its synchronized audio and background media.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mb-4">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSaveRecording} className="space-y-4">
              {/* Song Title & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Song Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Our First Song, Birthday Recording"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Audio Upload / URL */}
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" />
                  <span>Audio Track *</span>
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-500/20 file:text-rose-300 hover:file:bg-rose-500/30 cursor-pointer"
                />
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="Or enter audio URL (https://.../song.mp3)"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Song Cover Artwork */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Cover Artwork (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImageFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-white/10 file:text-white cursor-pointer"
                  />
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="Or cover image URL..."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Background Media Type Selection */}
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Background Media Layer
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      backgroundMediaType === 'video'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mediaType"
                      value="video"
                      checked={backgroundMediaType === 'video'}
                      onChange={() => setBackgroundMediaType('video')}
                      className="hidden"
                    />
                    <Video className="w-4 h-4" />
                    <span>Video</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      backgroundMediaType === 'image'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mediaType"
                      value="image"
                      checked={backgroundMediaType === 'image'}
                      onChange={() => setBackgroundMediaType('image')}
                      className="hidden"
                    />
                    <ImageIcon className="w-4 h-4" />
                    <span>Image</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      backgroundMediaType === 'none'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mediaType"
                      value="none"
                      checked={backgroundMediaType === 'none'}
                      onChange={() => setBackgroundMediaType('none')}
                      className="hidden"
                    />
                    <span>None (Ambient)</span>
                  </label>
                </div>

                {/* Conditional Dynamic Media Uploaders */}
                {backgroundMediaType === 'video' && (
                  <div className="pt-2 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-purple-300 font-medium">
                        Upload Background Video (.mp4, .webm, .mov)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        4:3, 16:9 & 9:16 Auto-Adapted
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => setBackgroundVideoFile(e.target.files[0])}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 cursor-pointer"
                    />
                    <input
                      type="url"
                      value={backgroundVideoUrl}
                      onChange={(e) => setBackgroundVideoUrl(e.target.value)}
                      placeholder="Or background video URL (https://.../video.mp4)"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
                    />

                    {/* Live Video Preview in Modal */}
                    {(backgroundVideoFile || backgroundVideoUrl) && (
                      <div className="mt-2 p-2 rounded-xl bg-black/50 border border-purple-500/30 flex items-center gap-3">
                        <div className="w-20 h-14 rounded-lg bg-black overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
                          <video
                            src={backgroundVideoFile ? URL.createObjectURL(backgroundVideoFile) : backgroundVideoUrl}
                            muted
                            autoPlay
                            loop
                            playsInline
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-purple-200 truncate">
                            {backgroundVideoFile ? backgroundVideoFile.name : 'Remote Video Attached'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Auto-centered with ambient color fill
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {backgroundMediaType === 'image' && (
                  <div className="pt-2 space-y-2 animate-fadeIn">
                    <span className="text-[11px] text-blue-300 font-medium">
                      Upload Background Photo (.jpg, .png, .webp)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBackgroundImageFile(e.target.files[0])}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30 cursor-pointer"
                    />
                    <input
                      type="url"
                      value={backgroundImageUrl}
                      onChange={(e) => setBackgroundImageUrl(e.target.value)}
                      placeholder="Or background image URL (https://.../photo.jpg)"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Description & Personal Message */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. The song that played on our first road trip."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Personal Note / Message
                  </label>
                  <textarea
                    rows={2}
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="e.g. Every time I hear this, I remember you! ♡"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Active status */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 accent-rose-500"
                />
                <label htmlFor="recIsActive" className="text-xs text-slate-300 cursor-pointer">
                  Active (Uncheck to temporarily hide from public vault)
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-card hover:bg-white/10 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-semibold shadow transition-all flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingRecording ? 'Update Recording' : 'Save to Vault'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
