// ─────────────────────────────────────────────────────────
//  Test: Health Check Endpoint
// ─────────────────────────────────────────────────────────
import request from 'supertest';
import app from '../app.js';

describe('Health Check — GET /api/health', () => {
  test('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('message', 'TrincoMate API is running.');
  });
});
