import express from 'express';
import {
  getAllSiblings,
  getSiblingById,
  createSibling,
  updateSibling,
  deleteSibling,
  getGeneratedCardId,
} from '../controllers/siblingController.js';
import {
  getRecordingsBySibling,
  createRecording,
} from '../controllers/recordingController.js';
import { verifyAdmin } from '../middleware/auth.js';
import { upload } from '../config/storage.js';

const router = express.Router();

// All sibling management routes are protected by admin auth
router.use(verifyAdmin);

router.get('/generate-card-id', getGeneratedCardId);

router.route('/')
  .get(getAllSiblings)
  .post(
    upload.fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
    createSibling
  );

router.route('/:id')
  .get(getSiblingById)
  .put(
    upload.fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
    updateSibling
  );

router.delete('/:id', deleteSibling);

// Sub-routes for recordings under a specific sibling
router.route('/:siblingId/recordings')
  .get(getRecordingsBySibling)
  .post(
    upload.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
      { name: 'backgroundVideo', maxCount: 1 },
      { name: 'backgroundImage', maxCount: 1 },
    ]),
    createRecording
  );

export default router;
