import { Router } from 'express';
import {
  getOwners,
  getUsers,
  login,
  register,
  removeOwner,
  setUserRole,
  updateOwnerStatus,
} from '../controllers/authController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);

router.get('/owners', verifyToken, requireRole('admin'), getOwners);
router.get('/users', verifyToken, requireRole('admin'), getUsers);
router.put('/owners/:id/status', verifyToken, requireRole('admin'), updateOwnerStatus);
router.delete('/owners/:id', verifyToken, requireRole('admin'), removeOwner);

// Admin only — set user role
router.put('/role', verifyToken, requireRole('admin'), setUserRole);

export default router;
