import express from 'express';
import { verifyAccess, getPrivateVault, lockVault } from '../controllers/accessController.js';
import { accessVerifyLimiter } from '../middleware/rateLimiter.js';
import { verifyVaultAccess } from '../middleware/auth.js';

const router = express.Router();

// Public verification with brute-force rate limiter
router.post('/verify', accessVerifyLimiter, verifyAccess);
router.post('/lock', lockVault);

// Private endpoint to fetch unlocked memory vault data
router.get('/vault', verifyVaultAccess, getPrivateVault);

export default router;
