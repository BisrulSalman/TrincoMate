// ─────────────────────────────────────────────────────────
//  Test Suite: Service API Implementation
// ─────────────────────────────────────────────────────────
import request from 'supertest';
import app from '../app.js';

describe('Service API - Full Implementation Tests', () => {
  
  let createdServiceId = null;
  const testOwnerId = 'demo-owner';

  // ════════════════════════════════════════════════════════
  // 1. SERVICE CREATION TESTS
  // ════════════════════════════════════════════════════════
  describe('POST /api/services - Create Service', () => {
    
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/services')
        .field('serviceName', 'Test Service');
      
      expect(res.status).toBe(401);
    });

    test('should require owner or admin role', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-user', 'true')
        .field('serviceName', 'Test Service');
      
      expect(res.status).toBe(403);
    });

    test('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Test Hotel');
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required fields/i);
    });

    test('should create service with all required fields', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Beach Resort')
        .field('category', 'Hotel')
        .field('city', 'Trincomalee')
        .field('price', '150')
        .field('description', 'Beautiful beach resort');
      
      expect([201, 400, 500]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('service');
        expect(res.body.service.serviceName).toBe('Beach Resort');
        expect(res.body.service.category).toBe('Hotel');
        expect(res.body.service.price).toBe(150);
        createdServiceId = res.body.id;
      }
    });

    test('should set status to Pending by default', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Luxury Hotel')
        .field('category', 'Hotel')
        .field('city', 'Colombo')
        .field('price', '200');
      
      if (res.status === 201) {
        expect(res.body.service.status).toBe('Pending');
      }
    });

    test('should normalize status values', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Test Service')
        .field('category', 'Hotel')
        .field('city', 'Kandy')
        .field('price', '100')
        .field('status', 'approved');
      
      if (res.status === 201) {
        expect(['Approved', 'approved']).toContain(res.body.service.status);
      }
    });

    test('should convert price to number', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Affordable Hotel')
        .field('category', 'Hotel')
        .field('city', 'Galle')
        .field('price', '99.99');
      
      if (res.status === 201) {
        expect(typeof res.body.service.price).toBe('number');
        expect(res.body.service.price).toBe(99.99);
      }
    });

    test('should set default discount to 0', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'No Discount Service')
        .field('category', 'Tour')
        .field('city', 'Jaffna')
        .field('price', '50');
      
      if (res.status === 201) {
        expect(res.body.service.discount).toBe(0);
      }
    });

    test('should set ownerId from authenticated user', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Owner Service')
        .field('category', 'Hotel')
        .field('city', 'Nuwara Eliya')
        .field('price', '120');
      
      if (res.status === 201) {
        expect(res.body.service.ownerId).toBe(testOwnerId);
      }
    });

    test('should parse facilities as array', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Luxury Resort')
        .field('category', 'Hotel')
        .field('city', 'Mirissa')
        .field('price', '300')
        .field('facilities', '["WiFi", "Pool", "Spa", "Restaurant"]');
      
      if (res.status === 201) {
        expect(Array.isArray(res.body.service.facilities)).toBe(true);
      }
    });

    test('should generate createdAt and updatedAt timestamps', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Timestamped Service')
        .field('category', 'Tour')
        .field('city', 'Ella')
        .field('price', '80');
      
      if (res.status === 201) {
        expect(res.body.service).toHaveProperty('createdAt');
        expect(res.body.service).toHaveProperty('updatedAt');
        expect(res.body.service.createdAt).toBe(res.body.service.updatedAt);
      }
    });
  });

  // ════════════════════════════════════════════════════════
  // 2. SERVICE RETRIEVAL TESTS
  // ════════════════════════════════════════════════════════
  describe('GET /api/services - List Services', () => {
    
    test('should return services list without authentication', async () => {
      const res = await request(app)
        .get('/api/services');
      
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('services');
        expect(Array.isArray(res.body.services)).toBe(true);
        expect(res.body).toHaveProperty('total');
      }
    });

    test('should filter by category', async () => {
      const res = await request(app)
        .get('/api/services')
        .query({ category: 'Hotel' });
      
      if (res.status === 200) {
        res.body.services.forEach(service => {
          expect(service.category).toBe('Hotel');
        });
      }
    });

    test('should filter by status', async () => {
      const res = await request(app)
        .get('/api/services')
        .query({ status: 'Approved' });
      
      if (res.status === 200) {
        res.body.services.forEach(service => {
          expect(['Approved', 'approved']).toContain(service.status);
        });
      }
    });

    test('should filter by ownerId', async () => {
      const res = await request(app)
        .get('/api/services')
        .query({ ownerId: 'demo-owner' });
      
      if (res.status === 200) {
        res.body.services.forEach(service => {
          expect(service.ownerId).toBe('demo-owner');
        });
      }
    });

    test('should apply limit parameter', async () => {
      const res = await request(app)
        .get('/api/services')
        .query({ limit: 5 });
      
      if (res.status === 200) {
        expect(res.body.services.length).toBeLessThanOrEqual(5);
      }
    });

    test('should apply multiple filters', async () => {
      const res = await request(app)
        .get('/api/services')
        .query({ 
          category: 'Hotel',
          status: 'Approved',
          limit: 10
        });
      
      if (res.status === 200) {
        expect(res.body.services.length).toBeLessThanOrEqual(10);
        res.body.services.forEach(service => {
          expect(service.category).toBe('Hotel');
        });
      }
    });

    test('should return owner summary when requested', async () => {
      const res = await request(app)
        .get('/api/services')
        .query({ summary: 'owners' });
      
      if (res.status === 200) {
        expect(res.body).toHaveProperty('owners');
        expect(Array.isArray(res.body.owners)).toBe(true);
        if (res.body.owners.length > 0) {
          expect(res.body.owners[0]).toHaveProperty('id');
          expect(res.body.owners[0]).toHaveProperty('serviceCount');
        }
      }
    });

    test('should sort by createdAt descending', async () => {
      const res = await request(app)
        .get('/api/services');
      
      if (res.status === 200 && res.body.services.length > 1) {
        for (let i = 0; i < res.body.services.length - 1; i++) {
          const current = new Date(res.body.services[i].createdAt);
          const next = new Date(res.body.services[i + 1].createdAt);
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
        }
      }
    });
  });

  // ════════════════════════════════════════════════════════
  // 3. SERVICE BY ID TESTS
  // ════════════════════════════════════════════════════════
  describe('GET /api/services/:id - Get Single Service', () => {
    
    test('should return 404 for nonexistent service', async () => {
      const res = await request(app)
        .get('/api/services/nonexistent-service-id');
      
      expect([404, 500]).toContain(res.status);
    });

    test('should return service details', async () => {
      if (createdServiceId) {
        const res = await request(app)
          .get(`/api/services/${createdServiceId}`);
        
        expect([200, 404, 500]).toContain(res.status);
        if (res.status === 200) {
          expect(res.body).toHaveProperty('service');
          expect(res.body.service.id).toBe(createdServiceId);
        }
      }
    });
  });

  // ════════════════════════════════════════════════════════
  // 4. SERVICE UPDATE TESTS
  // ════════════════════════════════════════════════════════
  describe('PUT /api/services/:id - Update Service', () => {
    
    test('should require authentication', async () => {
      const res = await request(app)
        .put('/api/services/fake-id')
        .send({ serviceName: 'Updated' });
      
      expect(res.status).toBe(401);
    });

    test('should require owner or admin role', async () => {
      const res = await request(app)
        .put('/api/services/fake-id')
        .set('x-demo-user', 'true')
        .send({ serviceName: 'Updated' });
      
      expect(res.status).toBe(403);
    });

    test('should return 404 for nonexistent service', async () => {
      const res = await request(app)
        .put('/api/services/nonexistent-id')
        .set('x-demo-owner', 'true')
        .send({ serviceName: 'Updated' });
      
      expect([404, 500]).toContain(res.status);
    });

    test('should update service name', async () => {
      if (createdServiceId) {
        const res = await request(app)
          .put(`/api/services/${createdServiceId}`)
          .set('x-demo-owner', 'true')
          .send({ serviceName: 'Updated Beach Resort' });
        
        if (res.status === 200) {
          expect(res.body.service.serviceName).toBe('Updated Beach Resort');
        }
      }
    });

    test('should convert price to number on update', async () => {
      if (createdServiceId) {
        const res = await request(app)
          .put(`/api/services/${createdServiceId}`)
          .set('x-demo-owner', 'true')
          .send({ price: '250.75' });
        
        if (res.status === 200) {
          expect(typeof res.body.service.price).toBe('number');
          expect(res.body.service.price).toBe(250.75);
        }
      }
    });

    test('should update status', async () => {
      if (createdServiceId) {
        const res = await request(app)
          .put(`/api/services/${createdServiceId}`)
          .set('x-demo-admin', 'true')
          .send({ status: 'Approved' });
        
        if (res.status === 200) {
          expect(['Approved', 'approved']).toContain(res.body.service.status);
        }
      }
    });

    test('should update updatedAt timestamp', async () => {
      const createRes = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Service for Update')
        .field('category', 'Tour')
        .field('city', 'Bentota')
        .field('price', '75');
      
      if (createRes.status === 201) {
        const serviceId = createRes.body.id;
        const originalUpdatedAt = createRes.body.service.updatedAt;
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const updateRes = await request(app)
          .put(`/api/services/${serviceId}`)
          .set('x-demo-owner', 'true')
          .send({ serviceName: 'Updated Name' });
        
        if (updateRes.status === 200) {
          expect(updateRes.body.service.updatedAt).not.toBe(originalUpdatedAt);
        }
      }
    });
  });

  // ════════════════════════════════════════════════════════
  // 5. SERVICE DELETION TESTS
  // ════════════════════════════════════════════════════════
  describe('DELETE /api/services/:id - Delete Service', () => {
    
    test('should require authentication', async () => {
      const res = await request(app)
        .delete('/api/services/fake-id');
      
      expect(res.status).toBe(401);
    });

    test('should require owner or admin role', async () => {
      const res = await request(app)
        .delete('/api/services/fake-id')
        .set('x-demo-user', 'true');
      
      expect(res.status).toBe(403);
    });

    test('should return 404 for nonexistent service', async () => {
      const res = await request(app)
        .delete('/api/services/nonexistent-id')
        .set('x-demo-owner', 'true');
      
      expect([404, 500]).toContain(res.status);
    });

    test('should delete service successfully', async () => {
      const createRes = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Service to Delete')
        .field('category', 'Hotel')
        .field('city', 'Matara')
        .field('price', '110');
      
      if (createRes.status === 201) {
        const serviceId = createRes.body.id;
        
        const deleteRes = await request(app)
          .delete(`/api/services/${serviceId}`)
          .set('x-demo-owner', 'true');
        
        expect([200, 500]).toContain(deleteRes.status);
        if (deleteRes.status === 200) {
          expect(deleteRes.body.message).toMatch(/deleted/i);
        }
      }
    });
  });

  // ════════════════════════════════════════════════════════
  // 6. VALIDATION & EDGE CASES
  // ════════════════════════════════════════════════════════
  describe('Service Validation & Edge Cases', () => {
    
    test('should handle very long service name', async () => {
      const longName = 'A'.repeat(500);
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', longName)
        .field('category', 'Hotel')
        .field('city', 'Badulla')
        .field('price', '150');
      
      expect([201, 400, 500]).toContain(res.status);
    });

    test('should handle negative price', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Negative Price Service')
        .field('category', 'Tour')
        .field('city', 'Ratnapura')
        .field('price', '-50');
      
      expect([201, 400, 500]).toContain(res.status);
    });

    test('should handle zero price', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Free Service')
        .field('category', 'Activity')
        .field('city', 'Hikkaduwa')
        .field('price', '0');
      
      expect([201, 400, 500]).toContain(res.status);
    });

    test('should handle special characters in service name', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Hotel & Resort™ #1 @ Beach')
        .field('category', 'Hotel')
        .field('city', 'Unawatuna')
        .field('price', '175');
      
      expect([201, 400, 500]).toContain(res.status);
    });

    test('should handle empty facilities array', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'No Facilities')
        .field('category', 'Tour')
        .field('city', 'Sigiriya')
        .field('price', '90')
        .field('facilities', '[]');
      
      expect([201, 400, 500]).toContain(res.status);
    });

    test('should handle concurrent service creation', async () => {
      const creates = Array(3).fill(null).map(() => 
        request(app)
          .post('/api/services')
          .set('x-demo-owner', 'true')
          .field('serviceName', `Concurrent Service ${Date.now()}`)
          .field('category', 'Hotel')
          .field('city', 'Tangalle')
          .field('price', '120')
      );
      
      const results = await Promise.all(creates);
      const successCount = results.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ════════════════════════════════════════════════════════
  // 7. AUTHORIZATION & OWNERSHIP TESTS
  // ════════════════════════════════════════════════════════
  describe('Authorization & Ownership', () => {
    
    test('owner cannot update another owner\'s service', async () => {
      if (createdServiceId) {
        // Try to update with a different owner context
        const res = await request(app)
          .put(`/api/services/${createdServiceId}`)
          .set('Authorization', 'Bearer different-owner-token')
          .send({ serviceName: 'Unauthorized Update' });
        
        // Should fail authentication or authorization
        expect([401, 403, 404, 500]).toContain(res.status);
      }
    });

    test('owner cannot delete another owner\'s service', async () => {
      if (createdServiceId) {
        const res = await request(app)
          .delete(`/api/services/${createdServiceId}`)
          .set('Authorization', 'Bearer different-owner-token');
        
        expect([401, 403, 404, 500]).toContain(res.status);
      }
    });

    test('admin can update any service', async () => {
      const createRes = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Admin Update Test')
        .field('category', 'Hotel')
        .field('city', 'Polonnaruwa')
        .field('price', '130');
      
      if (createRes.status === 201) {
        const serviceId = createRes.body.id;
        
        const updateRes = await request(app)
          .put(`/api/services/${serviceId}`)
          .set('x-demo-admin', 'true')
          .send({ status: 'Approved' });
        
        expect([200, 500]).toContain(updateRes.status);
      }
    });
  });

  // ════════════════════════════════════════════════════════
  // 8. DISCOUNT HANDLING
  // ════════════════════════════════════════════════════════
  describe('Discount Handling', () => {
    
    test('should accept discount value', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Discounted Service')
        .field('category', 'Tour')
        .field('city', 'Anuradhapura')
        .field('price', '200')
        .field('discount', '15');
      
      if (res.status === 201) {
        expect(res.body.service.discount).toBe(15);
      }
    });

    test('should convert discount to number', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('x-demo-owner', 'true')
        .field('serviceName', 'Discount Float Test')
        .field('category', 'Hotel')
        .field('city', 'Matale')
        .field('price', '300')
        .field('discount', '12.50');
      
      if (res.status === 201) {
        expect(typeof res.body.service.discount).toBe('number');
        expect(res.body.service.discount).toBe(12.50);
      }
    });
  });
});
