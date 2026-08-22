import express from 'express';
import { adminLogin, getAdminMe, getDashboardStats } from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public login route
router.post('/login', adminLogin);

// Protected admin routes
router.get('/me', verifyAdmin, getAdminMe);
router.get('/stats', verifyAdmin, getDashboardStats);

export default router;
