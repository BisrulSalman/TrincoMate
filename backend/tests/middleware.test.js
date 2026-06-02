// ─────────────────────────────────────────────────────────
//  Test: Auth Middleware (verifyToken & requireRole)
// ─────────────────────────────────────────────────────────
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-dev-secret';

// Import middleware directly
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

// Create a mini Express app just for middleware testing
function createTestApp() {
  const app = express();
  app.use(express.json());

  // Protected route that needs verifyToken
  app.get('/protected', verifyToken, (req, res) => {
    res.json({ user: req.user });
  });

  // Route that needs admin role
  app.get('/admin-only', verifyToken, requireRole('admin'), (req, res) => {
    res.json({ user: req.user });
  });

  // Route that needs owner or admin
  app.get('/owner-or-admin', verifyToken, requireRole('owner', 'admin'), (req, res) => {
    res.json({ user: req.user });
  });

  return app;
}

describe('Auth Middleware', () => {
  let testApp;

  beforeAll(() => {
    testApp = createTestApp();
  });

  // ─── verifyToken ─────────────────────────────────────
  describe('verifyToken', () => {
    test('should reject requests without Authorization header', async () => {
      const res = await request(testApp).get('/protected');
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Missing or malformed/i);
    });

    test('should reject requests with malformed Authorization header', async () => {
      const res = await request(testApp)
        .get('/protected')
        .set('Authorization', 'Basic abc123');
      expect(res.status).toBe(401);
    });

    test('should reject requests with invalid JWT token', async () => {
      const res = await request(testApp)
        .get('/protected')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });

    test('should accept a valid JWT token', async () => {
      const payload = { uid: 'user-1', email: 'test@test.com', role: 'user', name: 'Test' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const res = await request(testApp)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('uid', 'user-1');
      expect(res.body.user).toHaveProperty('email', 'test@test.com');
      expect(res.body.user).toHaveProperty('role', 'user');
    });

    test('should accept demo-admin header in non-production', async () => {
      const res = await request(testApp)
        .get('/protected')
        .set('x-demo-admin', 'true');
      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('role', 'admin');
    });

    test('should accept demo-owner header in non-production', async () => {
      const res = await request(testApp)
        .get('/protected')
        .set('x-demo-owner', 'true');
      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('role', 'owner');
    });

    test('should accept demo-user header in non-production', async () => {
      const res = await request(testApp)
        .get('/protected')
        .set('x-demo-user', 'true');
      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('role', 'user');
    });
  });

  // ─── requireRole ─────────────────────────────────────
  describe('requireRole', () => {
    test('should deny access if user role does not match', async () => {
      const payload = { uid: 'user-1', email: 'test@test.com', role: 'user', name: 'Test' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const res = await request(testApp)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Access denied/i);
    });

    test('should allow access if user role matches', async () => {
      const payload = { uid: 'admin-1', email: 'admin@test.com', role: 'admin', name: 'Admin' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const res = await request(testApp)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    test('should allow owner on owner-or-admin route', async () => {
      const payload = { uid: 'owner-1', email: 'owner@test.com', role: 'owner', name: 'Owner' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const res = await request(testApp)
        .get('/owner-or-admin')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    test('should allow admin on owner-or-admin route', async () => {
      const payload = { uid: 'admin-1', email: 'admin@test.com', role: 'admin', name: 'Admin' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const res = await request(testApp)
        .get('/owner-or-admin')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    test('should deny regular user on owner-or-admin route', async () => {
      const payload = { uid: 'user-1', email: 'user@test.com', role: 'user', name: 'User' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const res = await request(testApp)
        .get('/owner-or-admin')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    test('should work with demo-admin header on admin-only route', async () => {
      const res = await request(testApp)
        .get('/admin-only')
        .set('x-demo-admin', 'true');
      expect(res.status).toBe(200);
    });

    test('should deny demo-user on admin-only route', async () => {
      const res = await request(testApp)
        .get('/admin-only')
        .set('x-demo-user', 'true');
      expect(res.status).toBe(403);
    });
  });
});
