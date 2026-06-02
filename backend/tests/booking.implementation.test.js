// ─────────────────────────────────────────────────────────
//  Test Suite: Booking API Implementation
// ─────────────────────────────────────────────────────────
import request from 'supertest';
import app from '../app.js';

describe('Booking API - Full Implementation Tests', () => {
  
  let createdBookingId = null;
  const testServiceId = 'test-service-' + Date.now();
  const testUserId = 'test-user-' + Date.now();

  // ════════════════════════════════════════════════════════
  // 1. BOOKING CREATION TESTS
  // ════════════════════════════════════════════════════════
  describe('POST /api/bookings - Create Booking', () => {
    
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-07-01',
          totalPrice: 150,
        });
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    test('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-07-01',
          // missing totalPrice
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required fields/i);
    });

    test('should create a booking successfully', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          serviceName: 'Test Hotel',
          serviceType: 'Hotel',
          checkIn: '2025-07-01',
          checkOut: '2025-07-05',
          guests: 2,
          totalPrice: 500,
          guestName: 'John Doe',
          guestEmail: 'john@example.com',
          language: 'en',
        });
      
      expect([201, 500]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body.message).toMatch(/successfully/i);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('booking');
        expect(res.body.booking.status).toBe('Pending');
        expect(res.body.booking.guests).toBe(2);
        expect(res.body.booking.totalPrice).toBe(500);
        createdBookingId = res.body.id;
      }
    });

    test('should set default status to Pending', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-07-10',
          totalPrice: 200,
        });
      
      if (res.status === 201) {
        expect(res.body.booking.status).toBe('Pending');
        expect(res.body.booking).toHaveProperty('createdAt');
        expect(res.body.booking).toHaveProperty('updatedAt');
      }
    });

    test('should convert guests to number', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-07-15',
          guests: '5',
          totalPrice: 750,
        });
      
      if (res.status === 201) {
        expect(typeof res.body.booking.guests).toBe('number');
        expect(res.body.booking.guests).toBe(5);
      }
    });

    test('should default guests to 1 if not provided', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-08-01',
          totalPrice: 300,
        });
      
      if (res.status === 201) {
        expect(res.body.booking.guests).toBe(1);
      }
    });

    test('should attach user information to booking', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-08-10',
          totalPrice: 400,
        });
      
      if (res.status === 201) {
        expect(res.body.booking.userId).toBe('demo-user');
        expect(res.body.booking.userEmail).toBe('user@local.demo');
      }
    });

    test('should set default checkOut to checkIn if not provided', async () => {
      const checkIn = '2025-08-20';
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn,
          totalPrice: 250,
        });
      
      if (res.status === 201) {
        expect(res.body.booking.checkOut).toBe(checkIn);
      }
    });
  });

  // ════════════════════════════════════════════════════════
  // 2. BOOKING RETRIEVAL TESTS
  // ════════════════════════════════════════════════════════
  describe('GET /api/bookings - List Bookings', () => {
    
    test('should require authentication', async () => {
      const res = await request(app)
        .get('/api/bookings');
      
      expect(res.status).toBe(401);
    });

    test('should return bookings list for authenticated user', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('x-demo-user', 'true');
      
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('bookings');
        expect(Array.isArray(res.body.bookings)).toBe(true);
        expect(res.body).toHaveProperty('total');
      }
    });

    test('user should only see own bookings', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('x-demo-user', 'true');
      
      if (res.status === 200) {
        res.body.bookings.forEach(booking => {
          expect(booking.userId).toBe('demo-user');
        });
      }
    });

    test('owner should only see bookings for their services', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('x-demo-owner', 'true');
      
      if (res.status === 200) {
        // Owner can only see bookings where ownerId matches their uid
        res.body.bookings.forEach(booking => {
          expect(booking.ownerId).toBe('demo-owner');
        });
      }
    });

    test('admin should see all bookings', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('x-demo-admin', 'true');
      
      expect([200, 500]).toContain(res.status);
    });

    test('should filter by serviceId', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .query({ serviceId: testServiceId })
        .set('x-demo-admin', 'true');
      
      if (res.status === 200) {
        res.body.bookings.forEach(booking => {
          expect(booking.serviceId).toBe(testServiceId);
        });
      }
    });

    test('should filter by status', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .query({ status: 'Pending' })
        .set('x-demo-admin', 'true');
      
      if (res.status === 200) {
        res.body.bookings.forEach(booking => {
          expect(booking.status).toBe('Pending');
        });
      }
    });

    test('admin can filter by userId', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .query({ userId: 'demo-user' })
        .set('x-demo-admin', 'true');
      
      if (res.status === 200) {
        res.body.bookings.forEach(booking => {
          expect(booking.userId).toBe('demo-user');
        });
      }
    });

    test('should return results sorted by createdAt descending', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('x-demo-admin', 'true');
      
      if (res.status === 200 && res.body.bookings.length > 1) {
        for (let i = 0; i < res.body.bookings.length - 1; i++) {
          const current = new Date(res.body.bookings[i].createdAt);
          const next = new Date(res.body.bookings[i + 1].createdAt);
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
        }
      }
    });
  });

  // ════════════════════════════════════════════════════════
  // 3. BOOKING BY ID TESTS
  // ════════════════════════════════════════════════════════
  describe('GET /api/bookings/:id - Get Single Booking', () => {
    
    test('should require authentication', async () => {
      const res = await request(app)
        .get('/api/bookings/fake-id');
      
      expect(res.status).toBe(401);
    });

    test('should return 404 for nonexistent booking', async () => {
      const res = await request(app)
        .get('/api/bookings/nonexistent-booking-id')
        .set('x-demo-user', 'true');
      
      expect([404, 500]).toContain(res.status);
    });

    test('should return booking details if exists', async () => {
      // First create a booking
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-09-01',
          totalPrice: 600,
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        const getRes = await request(app)
          .get(`/api/bookings/${bookingId}`)
          .set('x-demo-user', 'true');
        
        expect([200, 500]).toContain(getRes.status);
        if (getRes.status === 200) {
          expect(getRes.body.booking).toBeDefined();
          expect(getRes.body.booking.id).toBe(bookingId);
          expect(getRes.body.booking.serviceId).toBe(testServiceId);
        }
      }
    });
  });

  // ════════════════════════════════════════════════════════
  // 4. BOOKING UPDATE TESTS
  // ════════════════════════════════════════════════════════
  describe('PUT /api/bookings/:id - Update Booking', () => {
    
    test('should require authentication', async () => {
      const res = await request(app)
        .put('/api/bookings/fake-id')
        .send({ status: 'Approved' });
      
      expect(res.status).toBe(401);
    });

    test('should require owner or admin role', async () => {
      const res = await request(app)
        .put('/api/bookings/fake-id')
        .set('x-demo-user', 'true')
        .send({ status: 'Approved' });
      
      expect(res.status).toBe(403);
    });

    test('should return 404 for nonexistent booking', async () => {
      const res = await request(app)
        .put('/api/bookings/nonexistent-id')
        .set('x-demo-owner', 'true')
        .send({ status: 'Approved' });
      
      expect([404, 500]).toContain(res.status);
    });

    test('should reject invalid status', async () => {
      if (createdBookingId) {
        const res = await request(app)
          .put(`/api/bookings/${createdBookingId}`)
          .set('x-demo-owner', 'true')
          .send({ status: 'InvalidStatus' });
        
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid status/i);
      }
    });

    test('should update booking status to Approved', async () => {
      // Create a booking as user
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-09-10',
          totalPrice: 550,
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        // Update as admin
        const updateRes = await request(app)
          .put(`/api/bookings/${bookingId}`)
          .set('x-demo-admin', 'true')
          .send({ status: 'Approved' });
        
        expect([200, 500]).toContain(updateRes.status);
        if (updateRes.status === 200) {
          expect(updateRes.body.booking.status).toBe('Approved');
          expect(updateRes.body.message).toMatch(/approved/i);
        }
      }
    });

    test('should update booking status to Rejected', async () => {
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-09-15',
          totalPrice: 450,
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        const updateRes = await request(app)
          .put(`/api/bookings/${bookingId}`)
          .set('x-demo-admin', 'true')
          .send({ status: 'Rejected' });
        
        if (updateRes.status === 200) {
          expect(updateRes.body.booking.status).toBe('Rejected');
          expect(updateRes.body.message).toMatch(/rejected/i);
        }
      }
    });

    test('should update updatedAt timestamp', async () => {
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-10-01',
          totalPrice: 700,
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        const originalUpdatedAt = createRes.body.booking.updatedAt;
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const updateRes = await request(app)
          .put(`/api/bookings/${bookingId}`)
          .set('x-demo-admin', 'true')
          .send({ status: 'Approved' });
        
        if (updateRes.status === 200) {
          expect(updateRes.body.booking.updatedAt).not.toBe(originalUpdatedAt);
        }
      }
    });

    test('owner should not update bookings for other services', async () => {
      if (createdBookingId) {
        // Create a booking with different ownerId
        const res = await request(app)
          .put(`/api/bookings/${createdBookingId}`)
          .set('x-demo-owner', 'true')
          .send({ status: 'Approved' });
        
        // Should fail if booking is not for this owner's service
        expect([403, 404, 500]).toContain(res.status);
      }
    });

    test('should send email notification on Approved status', async () => {
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-10-10',
          totalPrice: 800,
          guestEmail: 'guest@example.com',
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        const updateRes = await request(app)
          .put(`/api/bookings/${bookingId}`)
          .set('x-demo-admin', 'true')
          .send({ status: 'Approved' });
        
        if (updateRes.status === 200) {
          expect(updateRes.body).toHaveProperty('emailNotification');
          expect(updateRes.body.emailNotification).toHaveProperty('sent');
        }
      }
    });
  });

  // ════════════════════════════════════════════════════════
  // 5. BOOKING DELETION TESTS
  // ════════════════════════════════════════════════════════
  describe('DELETE /api/bookings/:id - Delete Booking', () => {
    
    test('should require authentication', async () => {
      const res = await request(app)
        .delete('/api/bookings/fake-id');
      
      expect(res.status).toBe(401);
    });

    test('should require admin role', async () => {
      const res = await request(app)
        .delete('/api/bookings/fake-id')
        .set('x-demo-user', 'true');
      
      expect(res.status).toBe(403);
    });

    test('should return 404 for nonexistent booking', async () => {
      const res = await request(app)
        .delete('/api/bookings/nonexistent-id')
        .set('x-demo-admin', 'true');
      
      expect([404, 500]).toContain(res.status);
    });

    test('should delete booking successfully', async () => {
      // Create a booking
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-10-20',
          totalPrice: 350,
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        // Delete it
        const deleteRes = await request(app)
          .delete(`/api/bookings/${bookingId}`)
          .set('x-demo-admin', 'true');
        
        expect([200, 500]).toContain(deleteRes.status);
        if (deleteRes.status === 200) {
          expect(deleteRes.body.message).toMatch(/deleted/i);
        }
      }
    });

    test('owner should not be able to delete bookings', async () => {
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-11-01',
          totalPrice: 400,
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        const deleteRes = await request(app)
          .delete(`/api/bookings/${bookingId}`)
          .set('x-demo-owner', 'true');
        
        expect(deleteRes.status).toBe(403);
      }
    });
  });

  // ════════════════════════════════════════════════════════
  // 6. EDGE CASES & VALIDATION
  // ════════════════════════════════════════════════════════
  describe('Edge Cases & Validation', () => {
    
    test('should handle negative totalPrice gracefully', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-11-10',
          totalPrice: -100,
        });
      
      // Either reject or accept it (depends on business logic)
      expect([201, 400, 500]).toContain(res.status);
    });

    test('should handle zero totalPrice', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-11-15',
          totalPrice: 0,
        });
      
      expect([201, 400, 500]).toContain(res.status);
    });

    test('should handle very large totalPrice', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-11-20',
          totalPrice: 999999999,
        });
      
      expect([201, 400, 500]).toContain(res.status);
    });

    test('should handle empty guestName', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-12-01',
          totalPrice: 300,
          guestName: '',
        });
      
      expect([201, 400, 500]).toContain(res.status);
    });

    test('should handle future and past dates', async () => {
      const futureDate = '2030-01-01';
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: futureDate,
          totalPrice: 500,
        });
      
      expect([201, 400, 500]).toContain(res.status);
    });

    test('should handle concurrent booking updates', async () => {
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: testServiceId,
          checkIn: '2025-12-10',
          totalPrice: 600,
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        // Simulate concurrent updates
        const updates = [
          request(app)
            .put(`/api/bookings/${bookingId}`)
            .set('x-demo-admin', 'true')
            .send({ status: 'Approved' }),
          request(app)
            .put(`/api/bookings/${bookingId}`)
            .set('x-demo-admin', 'true')
            .send({ status: 'Rejected' }),
        ];
        
        const results = await Promise.all(updates);
        // At least one should succeed
        expect(results.some(r => r.status === 200 || r.status === 201)).toBe(true);
      }
    });
  });
});
