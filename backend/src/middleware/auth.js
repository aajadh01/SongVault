import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { Sibling } from '../models/Sibling.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sibling_vault_super_secret_jwt_key_2026_production';

// Verify Admin JWT
export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
    }

    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin account not found.' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Verify Vault Access Token (issued after entering correct 6-digit secret code)
export const verifyVaultAccess = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Vault locked. Please enter your secret code.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'vault_access' || !decoded.siblingId) {
      return res.status(403).json({ success: false, message: 'Invalid vault session.' });
    }

    const sibling = await Sibling.findById(decoded.siblingId).select('-secretCodeHash');
    if (!sibling || !sibling.isActive) {
      return res.status(403).json({ success: false, message: 'Sibling vault is inactive or not found.' });
    }

    req.sibling = sibling;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Vault session expired. Please re-enter your code.' });
  }
};
