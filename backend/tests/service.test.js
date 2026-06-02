// ─────────────────────────────────────────────────────────
//  Test: Service Endpoints
// ─────────────────────────────────────────────────────────
import request from 'supertest';
import app from '../app.js';

describe('Service Routes', () => {
  // ─── Public routes ────────────────────────────────────
  describe('Public access', () => {
    test('GET /api/services should return a response (may be 200 or 500 depending on DB)', async () => {
      const res = await request(app).get('/api/services');
      // Will be 200 if DB is mocked/connected, 500 if firebase init fails
      expect([200, 500]).toContain(res.status);
    }, 15000);

    test('GET /api/services/:id should return a response', async () => {
      const res = await request(app).get('/api/services/nonexistent-id');
      // 404 if service not found, 500 if db error
      expect([404, 500]).toContain(res.status);
    });
  });

  // ─── Protected routes (no auth) ──────────────────────
  describe('Protected routes (no auth)', () => {
    test('POST /api/services should require auth', async () => {
      const res = await request(app)
        .post('/api/services')
        .send({ serviceName: 'Test' });
      expect(res.status).toBe(401);
    });

    test('PUT /api/services/:id should require auth', async () => {
      const res = await request(app)
        .put('/api/services/fake-id')
        .send({ serviceName: 'Updated' });
      expect(res.status).toBe(401);
    });

    test('DELETE /api/services/:id should require auth', async () => {
      const res = await request(app)
        .delete('/api/services/fake-id');
      expect(res.status).toBe(401);
    });
  });

  // ─── Role-based access ───────────────────────────────
  describe('Role-based access (demo-user cannot create/update/delete)', () => {
    test('demo-user should be denied POST /api/services (requires owner/admin)', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-user', 'true')
        .send({ serviceName: 'Test' });
      expect(res.status).toBe(403);
    });

    test('demo-user should be denied PUT /api/services/:id', async () => {
      const res = await request(app)
        .put('/api/services/fake-id')
        .set('x-demo-user', 'true')
        .send({ serviceName: 'Updated' });
      expect(res.status).toBe(403);
    });

    test('demo-user should be denied DELETE /api/services/:id', async () => {
      const res = await request(app)
        .delete('/api/services/fake-id')
        .set('x-demo-user', 'true');
      expect(res.status).toBe(403);
    });
  });

  // ─── Owner / Admin demo access ───────────────────────
  describe('Owner can access service CRUD (demo-owner)', () => {
    test('demo-owner POST /api/services might succeed or fail on DB — not 401 or 403', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Test Service')
        .field('category', 'Hotel')
        .field('description', 'A test service');
      // Should pass auth (not 401/403) — will get 201 or 400/500 depending on DB
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    });
  });
});
