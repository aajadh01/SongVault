import jwt from 'jsonwebtoken';
import { Sibling } from '../models/Sibling.js';
import { Recording } from '../models/Recording.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sibling_vault_super_secret_jwt_key_2026_production';

// POST /api/access/verify
export const verifyAccess = async (req, res) => {
  try {
    const { cardId, code } = req.body;

    if (!cardId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Card ID and Secret Code.',
      });
    }

    const cleanCode = code.toString().trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit numeric code.',
      });
    }

    const sibling = await Sibling.findOne({
      cardId: cardId.trim().toUpperCase(),
    });

    if (!sibling) {
      return res.status(404).json({
        success: false,
        message: 'Vault not found for this card.',
      });
    }

    if (!sibling.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This memory vault is currently unavailable.',
      });
    }

    const isMatch = await sibling.verifySecretCode(cleanCode);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "That doesn't seem to be the right key. Try again. ♡",
      });
    }

    // Generate temporary vault access token (valid 24 hours)
    const vaultToken = jwt.sign(
      {
        siblingId: sibling._id,
        cardId: sibling.cardId,
        role: 'vault_access',
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Vault unlocked successfully. ♡',
      vaultToken,
      sibling: {
        id: sibling._id,
        name: sibling.name,
        cardId: sibling.cardId,
        coverImageUrl: sibling.coverImageUrl,
        profileImageUrl: sibling.profileImageUrl,
        welcomeMessage: sibling.welcomeMessage,
      },
    });
  } catch (err) {
    console.error('Verify access error:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while unlocking the vault.',
    });
  }
};

// GET /api/private/vault (Protected by verifyVaultAccess)
export const getPrivateVault = async (req, res) => {
  try {
    const sibling = req.sibling;

    // Fetch only active recordings for this sibling, ordered
    const recordings = await Recording.find({
      siblingId: sibling._id,
      isActive: true,
    }).sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      sibling: {
        id: sibling._id,
        name: sibling.name,
        cardId: sibling.cardId,
        coverImageUrl: sibling.coverImageUrl,
        profileImageUrl: sibling.profileImageUrl,
        welcomeMessage: sibling.welcomeMessage,
      },
      recordings,
    });
  } catch (err) {
    console.error('Private vault error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load vault contents.',
    });
  }
};

// POST /api/access/lock
export const lockVault = async (req, res) => {
  res.json({
    success: true,
    message: 'Vault locked.',
  });
};
