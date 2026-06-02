import { Router } from 'express';
import multer from 'multer';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Multer — store files in memory for Firebase Storage upload
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const serviceUpload = upload.fields([
  { name: 'coverImage', maxCount: 1 },
]);

// Public — browse services
router.get('/',    getServices);
router.get('/:id', getServiceById);

// Owner — create / update / delete own services
router.post('/',    verifyToken, requireRole('owner', 'admin'), serviceUpload, createService);
router.put('/:id',  verifyToken, requireRole('owner', 'admin'), serviceUpload, updateService);
router.delete('/:id', verifyToken, requireRole('owner', 'admin'), deleteService);

export default router;
