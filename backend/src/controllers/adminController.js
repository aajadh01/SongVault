import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { Sibling } from '../models/Sibling.js';
import { Recording } from '../models/Recording.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sibling_vault_super_secret_jwt_key_2026_production';

// POST /api/admin/login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// GET /api/admin/me
export const getAdminMe = async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalSiblings,
      activeSiblings,
      totalRecordings,
      activeRecordings,
      videoCount,
      imageCount,
      recentSiblings,
      recentRecordings
    ] = await Promise.all([
      Sibling.countDocuments(),
      Sibling.countDocuments({ isActive: true }),
      Recording.countDocuments(),
      Recording.countDocuments({ isActive: true }),
      Recording.countDocuments({ backgroundMediaType: 'video' }),
      Recording.countDocuments({ backgroundMediaType: 'image' }),
      Sibling.find().sort({ createdAt: -1 }).limit(5).select('name cardId isActive createdAt'),
      Recording.find().populate('siblingId', 'name cardId').sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      stats: {
        totalSiblings,
        activeSiblings,
        totalRecordings,
        activeRecordings,
        totalVideos: videoCount,
        totalImages: imageCount,
        totalQRCodes: totalSiblings,
      },
      recentSiblings,
      recentRecordings,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
  }
};
