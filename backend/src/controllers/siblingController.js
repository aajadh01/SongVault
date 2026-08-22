import { Sibling } from '../models/Sibling.js';
import { Recording } from '../models/Recording.js';
import { getFileUrl } from '../config/storage.js';

// Helper to generate unique Card ID
const generateUniqueCardId = async (prefix = '') => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let cardId = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 20) {
    attempts++;
    let randomPart = '';
    const length = prefix ? 3 : 6;
    for (let i = 0; i < length; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    cardId = prefix ? `${prefix.substring(0, 3).toUpperCase()}${randomPart}` : randomPart;
    const found = await Sibling.findOne({ cardId });
    if (!found) exists = false;
  }
  return cardId;
};

// GET /api/siblings/generate-card-id
export const getGeneratedCardId = async (req, res) => {
  try {
    const { prefix } = req.query;
    const cardId = await generateUniqueCardId(prefix || '');
    res.json({ success: true, cardId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate card ID' });
  }
};

// GET /api/siblings
export const getAllSiblings = async (req, res) => {
  try {
    const siblings = await Sibling.find()
      .select('-secretCodeHash')
      .sort({ createdAt: -1 });

    // Attach recording counts and media stats
    const siblingsWithCounts = await Promise.all(
      siblings.map(async (sibling) => {
        const recordingCount = await Recording.countDocuments({ siblingId: sibling._id });
        const videoCount = await Recording.countDocuments({ siblingId: sibling._id, backgroundMediaType: 'video' });
        const imageCount = await Recording.countDocuments({ siblingId: sibling._id, backgroundMediaType: 'image' });
        return {
          ...sibling.toObject(),
          recordingCount,
          videoCount,
          imageCount,
        };
      })
    );

    res.json({ success: true, siblings: siblingsWithCounts });
  } catch (err) {
    console.error('Error fetching siblings:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch siblings' });
  }
};

// GET /api/siblings/:id
export const getSiblingById = async (req, res) => {
  try {
    const sibling = await Sibling.findById(req.params.id).select('-secretCodeHash');
    if (!sibling) {
      return res.status(404).json({ success: false, message: 'Sibling not found' });
    }

    const recordings = await Recording.find({ siblingId: sibling._id }).sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      sibling,
      recordings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch sibling' });
  }
};

// POST /api/siblings
export const createSibling = async (req, res) => {
  try {
    const { name, cardId, secretCode, hint, welcomeMessage, isActive } = req.body;

    if (!name || !cardId || !secretCode) {
      return res.status(400).json({ success: false, message: 'Name, Card ID, and 6-Digit Secret Code are required.' });
    }

    if (!/^\d{6}$/.test(secretCode.trim())) {
      return res.status(400).json({ success: false, message: 'Secret code must be exactly 6 numeric digits.' });
    }

    const formattedCardId = cardId.trim().toUpperCase();
    const existing = await Sibling.findOne({ cardId: formattedCardId });
    if (existing) {
      return res.status(400).json({ success: false, message: `Card ID '${formattedCardId}' is already in use.` });
    }

    // Handle file uploads if present
    let profileImageUrl = req.body.profileImageUrl || '';
    let coverImageUrl = req.body.coverImageUrl || '';

    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        profileImageUrl = (await getFileUrl(req.files.profileImage[0], req)) || profileImageUrl;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        coverImageUrl = (await getFileUrl(req.files.coverImage[0], req)) || coverImageUrl;
      }
    }

    const secretCodeHash = await Sibling.hashSecretCode(secretCode.trim());

    const sibling = await Sibling.create({
      name: name.trim(),
      cardId: formattedCardId,
      secretCodeHash,
      hint: hint ? hint.trim() : '',
      profileImageUrl,
      coverImageUrl,
      welcomeMessage: welcomeMessage ? welcomeMessage.trim() : 'Some memories deserve their own little place. ♡',
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
    });

    const sanitizedSibling = sibling.toObject();
    delete sanitizedSibling.secretCodeHash;

    res.status(201).json({
      success: true,
      message: 'Sibling vault created successfully.',
      sibling: sanitizedSibling,
    });
  } catch (err) {
    console.error('Error creating sibling:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create sibling' });
  }
};

// PUT /api/siblings/:id
export const updateSibling = async (req, res) => {
  try {
    const sibling = await Sibling.findById(req.params.id);
    if (!sibling) {
      return res.status(404).json({ success: false, message: 'Sibling not found' });
    }

    const { name, cardId, secretCode, hint, welcomeMessage, isActive } = req.body;

    if (name) sibling.name = name.trim();
    if (hint !== undefined) sibling.hint = hint.trim();
    if (welcomeMessage !== undefined) sibling.welcomeMessage = welcomeMessage.trim();
    if (isActive !== undefined) sibling.isActive = isActive === 'true' || isActive === true;

    if (cardId && cardId.trim().toUpperCase() !== sibling.cardId) {
      const formattedCardId = cardId.trim().toUpperCase();
      const existing = await Sibling.findOne({ cardId: formattedCardId, _id: { $ne: sibling._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: `Card ID '${formattedCardId}' is already in use.` });
      }
      sibling.cardId = formattedCardId;
    }

    if (secretCode && secretCode.trim() !== '') {
      if (!/^\d{6}$/.test(secretCode.trim())) {
        return res.status(400).json({ success: false, message: 'Secret code must be exactly 6 numeric digits.' });
      }
      sibling.secretCodeHash = await Sibling.hashSecretCode(secretCode.trim());
    }

    // Handle files
    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        sibling.profileImageUrl = (await getFileUrl(req.files.profileImage[0], req)) || sibling.profileImageUrl;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        sibling.coverImageUrl = (await getFileUrl(req.files.coverImage[0], req)) || sibling.coverImageUrl;
      }
    }

    if (req.body.profileImageUrl && !req.files?.profileImage) {
      sibling.profileImageUrl = req.body.profileImageUrl;
    }
    if (req.body.coverImageUrl && !req.files?.coverImage) {
      sibling.coverImageUrl = req.body.coverImageUrl;
    }

    await sibling.save();

    const sanitizedSibling = sibling.toObject();
    delete sanitizedSibling.secretCodeHash;

    res.json({
      success: true,
      message: 'Sibling updated successfully.',
      sibling: sanitizedSibling,
    });
  } catch (err) {
    console.error('Error updating sibling:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update sibling' });
  }
};

// DELETE /api/siblings/:id
export const deleteSibling = async (req, res) => {
  try {
    const sibling = await Sibling.findById(req.params.id);
    if (!sibling) {
      return res.status(404).json({ success: false, message: 'Sibling not found' });
    }

    // Cascade delete recordings
    await Recording.deleteMany({ siblingId: sibling._id });
    await Sibling.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Sibling vault and all recordings deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete sibling' });
  }
};
