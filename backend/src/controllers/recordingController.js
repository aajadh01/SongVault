import { Recording } from '../models/Recording.js';
import { Sibling } from '../models/Sibling.js';
import { getFileUrl } from '../config/storage.js';

// GET /api/siblings/:siblingId/recordings
export const getRecordingsBySibling = async (req, res) => {
  try {
    const { siblingId } = req.params;
    const recordings = await Recording.find({ siblingId }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, recordings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch recordings' });
  }
};

// POST /api/siblings/:siblingId/recordings
export const createRecording = async (req, res) => {
  try {
    const { siblingId } = req.params;
    const sibling = await Sibling.findById(siblingId);
    if (!sibling) {
      return res.status(404).json({ success: false, message: 'Sibling not found' });
    }

    const {
      title,
      backgroundMediaType = 'none',
      description,
      personalMessage,
      lyrics,
      order,
      isActive,
      duration,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Recording title is required' });
    }

    let audioUrl = req.body.audioUrl || '';
    let coverImageUrl = req.body.coverImageUrl || '';
    let backgroundVideoUrl = req.body.backgroundVideoUrl || '';
    let backgroundImageUrl = req.body.backgroundImageUrl || '';

    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        audioUrl = getFileUrl(req.files.audio[0], req);
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        coverImageUrl = getFileUrl(req.files.coverImage[0], req);
      }
      if (req.files.backgroundVideo && req.files.backgroundVideo[0]) {
        backgroundVideoUrl = getFileUrl(req.files.backgroundVideo[0], req);
      }
      if (req.files.backgroundImage && req.files.backgroundImage[0]) {
        backgroundImageUrl = getFileUrl(req.files.backgroundImage[0], req);
      }
    }

    if (!audioUrl) {
      return res.status(400).json({ success: false, message: 'Audio file or audio URL is required' });
    }

    // Determine current highest order
    const maxOrderDoc = await Recording.findOne({ siblingId }).sort({ order: -1 });
    const calculatedOrder = order !== undefined ? Number(order) : (maxOrderDoc ? maxOrderDoc.order + 1 : 0);

    const recording = await Recording.create({
      siblingId,
      title: title.trim(),
      audioUrl,
      coverImageUrl,
      backgroundMediaType,
      backgroundVideoUrl: backgroundMediaType === 'video' ? backgroundVideoUrl : '',
      backgroundImageUrl: backgroundMediaType === 'image' ? backgroundImageUrl : '',
      description: description ? description.trim() : '',
      personalMessage: personalMessage ? personalMessage.trim() : '',
      lyrics: lyrics ? lyrics.trim() : '',
      order: calculatedOrder,
      duration: duration ? Number(duration) : 0,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
    });

    res.status(201).json({
      success: true,
      message: 'Recording added successfully',
      recording,
    });
  } catch (err) {
    console.error('Error creating recording:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create recording' });
  }
};

// PUT /api/recordings/:id
export const updateRecording = async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    if (!recording) {
      return res.status(404).json({ success: false, message: 'Recording not found' });
    }

    const {
      title,
      backgroundMediaType,
      description,
      personalMessage,
      lyrics,
      order,
      isActive,
      duration,
    } = req.body;

    if (title) recording.title = title.trim();
    if (description !== undefined) recording.description = description.trim();
    if (personalMessage !== undefined) recording.personalMessage = personalMessage.trim();
    if (lyrics !== undefined) recording.lyrics = lyrics.trim();
    if (order !== undefined) recording.order = Number(order);
    if (duration !== undefined) recording.duration = Number(duration);
    if (isActive !== undefined) recording.isActive = isActive === 'true' || isActive === true;
    if (backgroundMediaType) recording.backgroundMediaType = backgroundMediaType;

    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        recording.audioUrl = getFileUrl(req.files.audio[0], req);
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        recording.coverImageUrl = getFileUrl(req.files.coverImage[0], req);
      }
      if (req.files.backgroundVideo && req.files.backgroundVideo[0]) {
        recording.backgroundVideoUrl = getFileUrl(req.files.backgroundVideo[0], req);
      }
      if (req.files.backgroundImage && req.files.backgroundImage[0]) {
        recording.backgroundImageUrl = getFileUrl(req.files.backgroundImage[0], req);
      }
    }

    if (req.body.audioUrl && !req.files?.audio) recording.audioUrl = req.body.audioUrl;
    if (req.body.coverImageUrl && !req.files?.coverImage) recording.coverImageUrl = req.body.coverImageUrl;
    if (req.body.backgroundVideoUrl && !req.files?.backgroundVideo) recording.backgroundVideoUrl = req.body.backgroundVideoUrl;
    if (req.body.backgroundImageUrl && !req.files?.backgroundImage) recording.backgroundImageUrl = req.body.backgroundImageUrl;

    if (recording.backgroundMediaType === 'none') {
      recording.backgroundVideoUrl = '';
      recording.backgroundImageUrl = '';
    } else if (recording.backgroundMediaType === 'video') {
      recording.backgroundImageUrl = '';
    } else if (recording.backgroundMediaType === 'image') {
      recording.backgroundVideoUrl = '';
    }

    await recording.save();

    res.json({
      success: true,
      message: 'Recording updated successfully',
      recording,
    });
  } catch (err) {
    console.error('Error updating recording:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update recording' });
  }
};

// DELETE /api/recordings/:id
export const deleteRecording = async (req, res) => {
  try {
    const recording = await Recording.findByIdAndDelete(req.params.id);
    if (!recording) {
      return res.status(404).json({ success: false, message: 'Recording not found' });
    }
    res.json({ success: true, message: 'Recording deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete recording' });
  }
};

// PATCH /api/recordings/reorder
export const reorderRecordings = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const updates = items.map((item) =>
      Recording.findByIdAndUpdate(item.id, { order: item.order })
    );
    await Promise.all(updates);

    res.json({ success: true, message: 'Recordings reordered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reorder recordings' });
  }
};
