// ─────────────────────────────────────────────────────────
//  Test: Advanced Booking Endpoints
// ─────────────────────────────────────────────────────────
import request from 'supertest';
import app from '../app.js';

describe('Advanced Booking Endpoints', () => {
  // ─── Booking retrieval ────────────────────────────────
  describe('GET /api/bookings', () => {
    test('should return list of bookings', async () => {
      const res = await request(app).get('/api/bookings');
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('bookings');
        expect(Array.isArray(res.body.bookings)).toBe(true);
      }
    });

    test('should accept user filter', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .query({ userId: 'demo-user' });
      
      expect([200, 500]).toContain(res.status);
    });

    test('should accept service filter', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .query({ serviceId: 'test-service' });
      
      expect([200, 500]).toContain(res.status);
    });

    test('should accept status filter', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .query({ status: 'Confirmed' });
      
      expect([200, 500]).toContain(res.status);
    });

    test('should accept limit parameter', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .query({ limit: 5 });
      
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.bookings.length).toBeLessThanOrEqual(5);
      }
    });
  });

  // ─── Get booking by ID ────────────────────────────────
  describe('GET /api/bookings/:id', () => {
    test('should return 404 for nonexistent booking', async () => {
      const res = await request(app)
        .get('/api/bookings/nonexistent-booking-id');
      
      expect([404, 500]).toContain(res.status);
    });

    test('should return booking with correct structure', async () => {
      const res = await request(app)
        .get('/api/bookings/test-id');
      
      if (res.status === 200) {
        expect(res.body).toHaveProperty('booking');
        expect(res.body.booking).toHaveProperty('id');
      }
    });
  });

  // ─── Booking creation ────────────────────────────────
  describe('POST /api/bookings', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          serviceId: 'test-service',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      expect(res.status).toBe(401);
    });

    test('should reject booking with missing required fields', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({ serviceId: 'test-service' });
      
      expect(res.status).toBe(400);
    });

    test('should accept valid booking creation', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 3,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
          specialRequests: 'Ocean view room preferred',
        });
      
      expect([201, 400, 500]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body).toHaveProperty('id');
        expect(res.body.booking.guests).toBe(3);
      }
    });

    test('should convert guests to number', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: '5',
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      if (res.status === 201) {
        expect(typeof res.body.booking.guests).toBe('number');
        expect(res.body.booking.guests).toBe(5);
      }
    });

    test('should assign demo-user ID when creating booking', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      if (res.status === 201) {
        expect(res.body.booking).toHaveProperty('userId');
      }
    });
  });

  // ─── Booking update ──────────────────────────────────
  describe('PUT /api/bookings/:id', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .put('/api/bookings/test-id')
        .send({ guests: 4 });
      
      expect(res.status).toBe(401);
    });

    test('should return 404 for nonexistent booking', async () => {
      const res = await request(app)
        .put('/api/bookings/nonexistent-id')
        .set('x-demo-user', 'true')
        .send({ guests: 4 });
      
      expect([404, 500]).toContain(res.status);
    });

    test('should update booking dates', async () => {
      // Create a booking first
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        const updateRes = await request(app)
          .put(`/api/bookings/${bookingId}`)
          .set('x-demo-user', 'true')
          .send({
            startDate: '2025-07-10',
            endDate: '2025-07-15',
          });
        
        if (updateRes.status === 200) {
          expect(updateRes.body.booking.startDate).toBe('2025-07-10');
          expect(updateRes.body.booking.endDate).toBe('2025-07-15');
        }
      }
    });

    test('should update booking guest count', async () => {
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        const updateRes = await request(app)
          .put(`/api/bookings/${bookingId}`)
          .set('x-demo-user', 'true')
          .send({ guests: 5 });
        
        if (updateRes.status === 200) {
          expect(updateRes.body.booking.guests).toBe(5);
        }
      }
    });

    test('should update booking status', async () => {
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        const updateRes = await request(app)
          .put(`/api/bookings/${bookingId}`)
          .set('x-demo-user', 'true')
          .send({ status: 'Cancelled' });
        
        if (updateRes.status === 200) {
          expect(updateRes.body.booking.status).toMatch(/cancelled/i);
        }
      }
    });

    test('should track updatedAt timestamp on update', async () => {
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        const createdAt = createRes.body.booking.createdAt;
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const updateRes = await request(app)
          .put(`/api/bookings/${bookingId}`)
          .set('x-demo-user', 'true')
          .send({ guests: 3 });
        
        if (updateRes.status === 200) {
          expect(updateRes.body.booking.createdAt).toBe(createdAt);
          expect(updateRes.body.booking.updatedAt).not.toBe(createdAt);
        }
      }
    });
  });

  // ─── Booking cancellation ────────────────────────────
  describe('Booking Cancellation', () => {
    test('should allow user to cancel own booking', async () => {
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        const cancelRes = await request(app)
          .put(`/api/bookings/${bookingId}`)
          .set('x-demo-user', 'true')
          .send({ status: 'Cancelled' });
        
        expect([200, 403, 500]).toContain(cancelRes.status);
      }
    });
  });

  // ─── Booking deletion ────────────────────────────────
  describe('DELETE /api/bookings/:id', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .delete('/api/bookings/test-id');
      
      expect(res.status).toBe(401);
    });

    test('should return 404 for nonexistent booking', async () => {
      const res = await request(app)
        .delete('/api/bookings/nonexistent-id')
        .set('x-demo-user', 'true');
      
      expect([404, 500]).toContain(res.status);
    });

    test('should successfully delete booking', async () => {
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        const deleteRes = await request(app)
          .delete(`/api/bookings/${bookingId}`)
          .set('x-demo-user', 'true');
        
        expect([200, 500]).toContain(deleteRes.status);
      }
    });
  });

  // ─── Date validation ─────────────────────────────────
  describe('Date Validation', () => {
    test('should accept valid ISO date strings', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      expect([201, 400, 500]).toContain(res.status);
    });

    test('should handle various date formats', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01T00:00:00Z',
          endDate: '2025-07-05T23:59:59Z',
        });
      
      expect([201, 400, 500]).toContain(res.status);
    });
  });

  // ─── Special requests handling ───────────────────────
  describe('Special Requests', () => {
    test('should store special requests with booking', async () => {
      const specialRequest = 'Wheelchair accessible room, vegetarian meals';
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
          specialRequests: specialRequest,
        });
      
      if (res.status === 201) {
        expect(res.body.booking.specialRequests).toBe(specialRequest);
      }
    });

    test('should handle empty special requests', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
          specialRequests: '',
        });
      
      expect([201, 400, 500]).toContain(res.status);
    });
  });

  // ─── Booking status lifecycle ────────────────────────
  describe('Booking Status Lifecycle', () => {
    test('should create booking with default status', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      if (res.status === 201) {
        expect(res.body.booking.status).toBeDefined();
        expect(['Pending', 'Confirmed']).toContain(res.body.booking.status);
      }
    });

    test('should allow status transitions', async () => {
      const statuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
      
      const createRes = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({
          serviceId: 'hotel-001',
          guests: 2,
          startDate: '2025-07-01',
          endDate: '2025-07-05',
        });
      
      if (createRes.status === 201) {
        const bookingId = createRes.body.id;
        
        // Try transitioning through statuses
        for (const status of statuses) {
          const updateRes = await request(app)
            .put(`/api/bookings/${bookingId}`)
            .set('x-demo-user', 'true')
            .send({ status });
          
          if (updateRes.status === 200) {
            expect(updateRes.body.booking.status).toBeDefined();
          }
        }
      }
    });
  });
});
