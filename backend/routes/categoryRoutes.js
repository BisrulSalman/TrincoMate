import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public — anyone can browse categories
router.get('/', getCategories);

// Admin only — manage categories
router.post('/',    verifyToken, requireRole('admin'), createCategory);
router.put('/:id',  verifyToken, requireRole('admin'), updateCategory);
router.delete('/:id', verifyToken, requireRole('admin'), deleteCategory);

export default router;
