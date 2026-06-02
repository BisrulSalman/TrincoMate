// ─────────────────────────────────────────────────────────
//  Booking Controller — CRUD for bookings
// ─────────────────────────────────────────────────────────
import { db } from '../config/firebaseAdmin.js';
import { sendBookingApprovedEmail } from '../utils/emailService.js';

const COLLECTION = 'bookings';

/**
 * POST /api/bookings
 * Body: { serviceId, serviceName, serviceType, checkIn, checkOut, guests, totalPrice }
 */
export const createBooking = async (req, res) => {
  try {
    const { serviceId, serviceName, serviceType, checkIn, checkOut, guests, totalPrice, guestName, guestEmail, language } = req.body;

    if (!serviceId || !checkIn || !totalPrice) {
      return res.status(400).json({
        error: 'Missing required fields: serviceId, checkIn, totalPrice.',
      });
    }

    let service = {};
    try {
      const serviceDoc = await db.collection('services').doc(serviceId).get();
      if (serviceDoc.exists) {
        service = { id: serviceDoc.id, ...serviceDoc.data() };
      }
    } catch (serviceErr) {
      console.warn(`Could not load service for booking: ${serviceErr.message}`);
    }

    const bookingDoc = {
      serviceId,
      serviceName: serviceName || service.serviceName || '',
      serviceType: serviceType || service.serviceType || service.category || '',
      ownerId: service.ownerId || '',
      guestName: guestName || '',
      guestEmail: guestEmail || req.user?.email || '',
      userId:      req.user?.uid || '',
      userEmail:   req.user?.email || '',
      language:    language || 'en',
      checkIn,
      checkOut:    checkOut || checkIn,
      guests:      Number(guests) || 1,
      totalPrice:  Number(totalPrice),
      status:      'Pending',
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION).add(bookingDoc);

    return res.status(201).json({
      message: 'Booking created successfully.',
      id: docRef.id,
      booking: { id: docRef.id, ...bookingDoc },
    });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ error: 'Failed to create booking.', details: err.message });
  }
};

/**
 * GET /api/bookings
 * Query: ?userId=xxx  |  ?serviceId=xxx  |  ?status=Pending
 */
export const getBookings = async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    let bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const role = req.user?.role || 'user';
    if (role === 'owner') {
      bookings = bookings.filter(booking => booking.ownerId === req.user.uid);
    } else if (role !== 'admin') {
      bookings = bookings.filter(booking => booking.userId === req.user.uid);
    }

    if (req.query.userId && role === 'admin') {
      bookings = bookings.filter(booking => booking.userId === req.query.userId);
    }
    if (req.query.serviceId) {
      bookings = bookings.filter(booking => booking.serviceId === req.query.serviceId);
    }
    if (req.query.status) {
      bookings = bookings.filter(booking => booking.status === req.query.status);
    }

    return res.json({ bookings, total: bookings.length });
  } catch (err) {
    console.error('Get bookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch bookings.', details: err.message });
  }
};

/**
 * GET /api/bookings/:id
 */
export const getBookingById = async (req, res) => {
  try {
    const doc = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    return res.json({ booking: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error('Get booking error:', err);
    return res.status(500).json({ error: 'Failed to fetch booking.', details: err.message });
  }
};

/**
 * PUT /api/bookings/:id
 * Body: { status: 'Approved' | 'Rejected' }
 * Used by owners/admins to approve or reject a booking.
 */
export const updateBooking = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Rejected'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const ref = db.collection(COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const booking = doc.data();
    const role = req.user?.role || 'user';
    if (role === 'owner' && booking.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Owners can only update bookings for their own services.' });
    }

    const updatedAt = new Date().toISOString();
    const updates = {
      status,
      updatedAt,
    };

    await ref.update(updates);

    const updatedBooking = { id: doc.id, ...booking, ...updates };
    let emailNotification = { sent: false, skipped: true };
    if (status === 'Approved' && booking.status !== 'Approved') {
      try {
        emailNotification = await sendBookingApprovedEmail(updatedBooking);
      } catch (emailErr) {
        emailNotification = { sent: false, skipped: false, error: emailErr.message };
        console.error('Booking approval email error:', emailErr);
      }
    }

    return res.json({
      message: `Booking ${status.toLowerCase()}.`,
      booking: updatedBooking,
      emailNotification,
    });
  } catch (err) {
    console.error('Update booking error:', err);
    return res.status(500).json({ error: 'Failed to update booking.', details: err.message });
  }
};

/**
 * DELETE /api/bookings/:id
 */
export const deleteBooking = async (req, res) => {
  try {
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    await ref.delete();
    return res.json({ message: 'Booking deleted.' });
  } catch (err) {
    console.error('Delete booking error:', err);
    return res.status(500).json({ error: 'Failed to delete booking.', details: err.message });
  }
};
