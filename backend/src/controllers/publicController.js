import { Sibling } from '../models/Sibling.js';
import QRCode from 'qrcode';

// GET /api/public/siblings/:cardId
export const getPublicSibling = async (req, res) => {
  try {
    const { cardId } = req.params;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        message: 'Card ID is required.',
      });
    }

    const sibling = await Sibling.findOne({
      cardId: cardId.trim().toUpperCase(),
    }).select('name cardId hint coverImageUrl profileImageUrl welcomeMessage isActive');

    if (!sibling) {
      return res.status(404).json({
        success: false,
        message: 'Memory vault not found. Please check your QR card link.',
      });
    }

    if (!sibling.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This memory vault is currently deactivated.',
      });
    }

    res.json({
      success: true,
      sibling: {
        name: sibling.name,
        cardId: sibling.cardId,
        hint: sibling.hint,
        coverImageUrl: sibling.coverImageUrl,
        profileImageUrl: sibling.profileImageUrl,
        welcomeMessage: sibling.welcomeMessage,
      },
    });
  } catch (err) {
    console.error('Public sibling error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve card information.',
    });
  }
};

// GET /api/public/qr/:cardId
export const generatePublicQR = async (req, res) => {
  try {
    const { cardId } = req.params;
    const format = req.query.format || 'png'; // 'png' or 'svg'
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const targetUrl = `${baseUrl}/s/${cardId.trim().toUpperCase()}`;

    if (format === 'svg') {
      const svgString = await QRCode.toString(targetUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="sibling-qr-${cardId}.svg"`);
      return res.send(svgString);
    }

    // Default PNG
    const buffer = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      width: 1024,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="sibling-qr-${cardId}.png"`);
    }
    res.setHeader('Content-Type', 'image/png');
    return res.send(buffer);
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate QR code' });
  }
};
