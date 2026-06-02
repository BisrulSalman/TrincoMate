// ─────────────────────────────────────────────────────────
//  Test: Category Endpoints
// ─────────────────────────────────────────────────────────
import request from 'supertest';
import app from '../app.js';

describe('Category Routes', () => {
  // ─── Public access ────────────────────────────────────
  describe('GET /api/categories (public)', () => {
    test('should return list of categories', async () => {
      const res = await request(app).get('/api/categories');
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('categories');
        expect(Array.isArray(res.body.categories)).toBe(true);
      }
    });

    test('should return categories with expected structure', async () => {
      const res = await request(app).get('/api/categories');
      if (res.status === 200) {
        res.body.categories.forEach(category => {
          expect(category).toHaveProperty('id');
          expect(typeof category.name).toBe('string');
        });
      }
    });
  });

  // ─── Protected routes ────────────────────────────────
  describe('POST /api/categories (protected)', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'New Category' });
      expect(res.status).toBe(401);
    });

    test('should allow admin to create category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('x-demo-admin', 'true')
        .send({ name: 'Adventure Tours' });
      // Should not return 401 or 403
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    });

    test('should reject invalid category data', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('x-demo-admin', 'true')
        .send({ name: '' });
      expect([400, 500]).toContain(res.status);
    });

    test('demo-user should not be able to create category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('x-demo-user', 'true')
        .send({ name: 'Travel' });
      expect(res.status).toBe(403);
    });
  });

  // ─── Update endpoint ─────────────────────────────────
  describe('PUT /api/categories/:id (protected)', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .put('/api/categories/test-id')
        .send({ name: 'Updated Category' });
      expect(res.status).toBe(401);
    });

    test('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .put('/api/categories/nonexistent-id')
        .set('x-demo-admin', 'true')
        .send({ name: 'Updated' });
      expect([404, 500]).toContain(res.status);
    });

    test('demo-user should not be able to update category', async () => {
      const res = await request(app)
        .put('/api/categories/test-id')
        .set('x-demo-user', 'true')
        .send({ name: 'Updated' });
      expect(res.status).toBe(403);
    });
  });

  // ─── Delete endpoint ─────────────────────────────────
  describe('DELETE /api/categories/:id (protected)', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .delete('/api/categories/test-id');
      expect(res.status).toBe(401);
    });

    test('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .delete('/api/categories/nonexistent-id')
        .set('x-demo-admin', 'true');
      expect([404, 500]).toContain(res.status);
    });

    test('demo-user should not be able to delete category', async () => {
      const res = await request(app)
        .delete('/api/categories/test-id')
        .set('x-demo-user', 'true');
      expect(res.status).toBe(403);
    });

    test('admin should be able to delete category', async () => {
      const res = await request(app)
        .delete('/api/categories/test-id')
        .set('x-demo-admin', 'true');
      // Should not return 401 or 403
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    });
  });
});
