import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// User — create bookings, view own bookings
router.post('/',   verifyToken, createBooking);
router.get('/',    verifyToken, getBookings);
router.get('/:id', verifyToken, getBookingById);

// Owner / Admin — approve or reject bookings
router.put('/:id/status', verifyToken, requireRole('owner', 'admin'), updateBooking);
router.put('/:id',        verifyToken, requireRole('owner', 'admin'), updateBooking);
router.delete('/:id', verifyToken, requireRole('admin'),          deleteBooking);

export default router;
