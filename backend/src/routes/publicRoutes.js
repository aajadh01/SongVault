import express from 'express';
import { getPublicSibling, generatePublicQR } from '../controllers/publicController.js';

const router = express.Router();

// Public route to view sibling landing card info (cardId, hint, name, cover)
router.get('/siblings/:cardId', getPublicSibling);

// Public route to get high-contrast QR code
router.get('/qr/:cardId', generatePublicQR);

export default router;
