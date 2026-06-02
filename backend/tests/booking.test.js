// ─────────────────────────────────────────────────────────
//  Test: Booking Endpoints
// ─────────────────────────────────────────────────────────
import request from 'supertest';
import app from '../app.js';

describe('Booking Routes', () => {
  // ─── Unauthenticated access ───────────────────────────
  describe('Unauthenticated access', () => {
    test('POST /api/bookings should require auth', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({ serviceId: 'svc1', checkIn: '2026-07-01', totalPrice: 100 });
      expect(res.status).toBe(401);
    });

    test('GET /api/bookings should require auth', async () => {
      const res = await request(app).get('/api/bookings');
      expect(res.status).toBe(401);
    });

    test('GET /api/bookings/:id should require auth', async () => {
      const res = await request(app).get('/api/bookings/fake-id');
      expect(res.status).toBe(401);
    });

    test('PUT /api/bookings/:id/status should require auth', async () => {
      const res = await request(app)
        .put('/api/bookings/fake-id/status')
        .send({ status: 'Approved' });
      expect(res.status).toBe(401);
    });

    test('DELETE /api/bookings/:id should require auth', async () => {
      const res = await request(app).delete('/api/bookings/fake-id');
      expect(res.status).toBe(401);
    });
  });

  // ─── With demo-user header (validation tests) ────────
  describe('Create booking validation (demo user)', () => {
    test('should reject booking without required fields', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Missing required fields/i);
    });

    test('should reject booking without serviceId', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({ checkIn: '2026-07-01', totalPrice: 100 });
      expect(res.status).toBe(400);
    });

    test('should reject booking without checkIn', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({ serviceId: 'svc1', totalPrice: 100 });
      expect(res.status).toBe(400);
    });

    test('should reject booking without totalPrice', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('x-demo-user', 'true')
        .send({ serviceId: 'svc1', checkIn: '2026-07-01' });
      expect(res.status).toBe(400);
    });
  });

  // ─── Role-based access ───────────────────────────────
  describe('Role-based access for booking status update', () => {
    test('demo-user should be denied PUT /api/bookings/:id/status (requires owner/admin)', async () => {
      const res = await request(app)
        .put('/api/bookings/fake-id/status')
        .set('x-demo-user', 'true')
        .send({ status: 'Approved' });
      expect(res.status).toBe(403);
    });

    test('demo-user should be denied DELETE /api/bookings/:id (requires admin)', async () => {
      const res = await request(app)
        .delete('/api/bookings/fake-id')
        .set('x-demo-user', 'true');
      expect(res.status).toBe(403);
    });
  });
});
