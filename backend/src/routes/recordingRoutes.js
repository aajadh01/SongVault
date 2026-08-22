import express from 'express';
import {
  updateRecording,
  deleteRecording,
  reorderRecordings,
} from '../controllers/recordingController.js';
import { verifyAdmin } from '../middleware/auth.js';
import { upload } from '../config/storage.js';

const router = express.Router();

// Protected by admin auth
router.use(verifyAdmin);

router.patch('/reorder', reorderRecordings);

router.route('/:id')
  .put(
    upload.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
      { name: 'backgroundVideo', maxCount: 1 },
      { name: 'backgroundImage', maxCount: 1 },
    ]),
    updateRecording
  )
  .delete(deleteRecording);

export default router;
