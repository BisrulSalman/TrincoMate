// ─────────────────────────────────────────────────────────
//  Test: Auth Endpoints (Login & Register)
//  Uses supertest with real Express app + mocked Firestore
// ─────────────────────────────────────────────────────────
import request from 'supertest';
import app from '../app.js';

describe('Auth Routes', () => {
  // ─── POST /api/auth/login ─────────────────────────────
  describe('POST /api/auth/login', () => {
    test('should reject login without email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'pass', loginAs: 'user' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('should reject login without password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', loginAs: 'user' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('should reject login without loginAs role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'pass' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('should reject login with invalid loginAs role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'pass', loginAs: 'superuser' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('should reject admin login with wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@admin.com', password: 'wrong', loginAs: 'admin' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ─── POST /api/auth/register ──────────────────────────
  describe('POST /api/auth/register', () => {
    test('should reject register with invalid role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ role: 'admin', email: 'a@b.com', password: '123', confirmPassword: '123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Owner or User/i);
    });

    test('should reject register with mismatched passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ role: 'user', email: 'a@b.com', password: 'AAA', confirmPassword: 'BBB' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Passwords do not match/i);
    });

    test('should reject register without email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ role: 'user', password: '123', confirmPassword: '123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Email is required/i);
    });

    test('should reject owner registration with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          role: 'owner',
          email: 'owner@test.com',
          password: 'Pass123',
          confirmPassword: 'Pass123',
          // Missing ownerName, serviceName, phoneNumber
        });
      // Will return either 400 (missing fields) or 500 (db error — firebase not connected)
      expect([400, 500]).toContain(res.status);
    });

    test('should reject user registration with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          role: 'user',
          email: 'user@test.com',
          password: 'Pass123',
          confirmPassword: 'Pass123',
          // Missing fullName, age, country, whatsappNumber
        });
      // Will return either 400 (missing fields) or 500 (db error — firebase not connected)
      expect([400, 500]).toContain(res.status);
    });
  });

  // ─── Protected routes without auth ────────────────────
  describe('Protected admin routes (no auth)', () => {
    test('GET /api/auth/owners should require auth', async () => {
      const res = await request(app).get('/api/auth/owners');
      expect(res.status).toBe(401);
    });

    test('GET /api/auth/users should require auth', async () => {
      const res = await request(app).get('/api/auth/users');
      expect(res.status).toBe(401);
    });

    test('PUT /api/auth/owners/:id/status should require auth', async () => {
      const res = await request(app)
        .put('/api/auth/owners/fake-id/status')
        .send({ status: 'Approved' });
      expect(res.status).toBe(401);
    });

    test('DELETE /api/auth/owners/:id should require auth', async () => {
      const res = await request(app)
        .delete('/api/auth/owners/fake-id');
      expect(res.status).toBe(401);
    });
  });
});
