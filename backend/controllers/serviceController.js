// ─────────────────────────────────────────────────────────
//  Service Controller — CRUD for tourism services
// ─────────────────────────────────────────────────────────
import { db, bucket } from '../config/firebaseAdmin.js';

const COLLECTION = 'services';

const STATUS_MAP = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  draft: 'Draft',
};

const normalizeStatus = (status) => {
  if (!status) return 'Pending';
  const key = String(status).trim().toLowerCase();
  return STATUS_MAP[key] || status;
};

const fileToDataUrl = (file) => (
  `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
);

const parseListField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value)
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map(item => item.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
};

/**
 * POST /api/services
 * Creates a new service document in Firestore.
 * If images are attached (via multer), uploads them to Firebase Storage.
 */
export const createService = async (req, res) => {
  try {
    const data = req.body;

    // Basic validation
    if (!data.serviceName || !data.category || !data.city || !data.price) {
      return res.status(400).json({
        error: 'Missing required fields: serviceName, category, city, price.',
      });
    }

    // Handle image uploads (multer puts files on req.files)
    let coverImageUrl = '';

    if (req.files) {
      const uploads = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const file of uploads) {
        let publicUrl;

        try {
          const remotePath = `services/${Date.now()}_${file.originalname}`;
          const blob = bucket.file(remotePath);
          await blob.save(file.buffer, {
            metadata: { contentType: file.mimetype },
          });
          await blob.makePublic();
          publicUrl = `https://storage.googleapis.com/${bucket.name}/${remotePath}`;
        } catch (uploadErr) {
          console.warn(`Image upload failed, storing inline image fallback: ${uploadErr.message}`);
          publicUrl = fileToDataUrl(file);
        }

        if (file.fieldname === 'coverImage') {
          coverImageUrl = publicUrl;
        }
        // other file fields (gallery) removed/ignored
      }
    }

    const serviceDoc = {
      ...data,
      price: Number(data.price),
      discount: data.discount ? Number(data.discount) : 0,
      facilities: parseListField(data.facilities),
      coverImage: coverImageUrl || data.coverImage || '',
      // gallery removed
      ownerId: req.user?.uid || '',
      status: normalizeStatus(data.status || 'Pending'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION).add(serviceDoc);

    return res.status(201).json({
      message: 'Service created successfully.',
      id: docRef.id,
      service: { id: docRef.id, ...serviceDoc },
    });
  } catch (err) {
    console.error('Create service error:', err);
    return res.status(500).json({ error: 'Failed to create service.', details: err.message });
  }
};

/**
 * GET /api/services
 * Optional query params: ?category=Hotels&status=approved&ownerId=xxx
 */
export const getServices = async (req, res) => {
  try {
    // Build Firestore query server-side to avoid fetching all documents
    let queryRef = db.collection(COLLECTION);

    const { category, status, ownerId } = req.query;
    const limit = Number(req.query.limit) || 100;

    if (category) queryRef = queryRef.where('category', '==', category);
    if (status) {
      const normalizedStatus = normalizeStatus(status);
      const statusCandidates = Array.from(new Set([
        normalizedStatus,
        String(status).trim(),
        String(status).trim().toLowerCase(),
        String(status).trim().toUpperCase(),
      ]));
      queryRef = queryRef.where('status', 'in', statusCandidates);
    }

    // Development helper: treat the special alias 'demo-owner' as a wildcard
    // so demo sessions can see services while the demo-owner id doesn't
    // necessarily match stored owner uids. Do not apply this in production.
    const isDemoOwnerAlias = ownerId === 'demo-owner';
    if (ownerId && !isDemoOwnerAlias) queryRef = queryRef.where('ownerId', '==', ownerId);

    let snapshot;
    try {
      snapshot = await queryRef.orderBy('createdAt', 'desc').limit(limit).get();
    } catch (orderErr) {
      console.warn('OrderBy on services failed (index may be required). Falling back to unordered query:', orderErr.message);
      snapshot = await queryRef.limit(limit).get();
    }

    let services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (req.query.summary === 'owners') {
      const ownerMap = new Map();

      services.forEach(service => {
        const ownerId = service.ownerId || 'unknown-owner';
        const owner = ownerMap.get(ownerId) || {
          id: ownerId,
          name: ownerId === 'demo-owner' ? 'Demo Owner' : ownerId,
          email: ownerId === 'demo-owner' ? 'owner@local.demo' : 'Unknown',
          serviceCount: 0,
          pendingCount: 0,
          approvedCount: 0,
          serviceIds: [],
        };

        owner.serviceCount += 1;
        if (service.status === 'Pending') owner.pendingCount += 1;
        if (service.status === 'Approved') owner.approvedCount += 1;
        owner.serviceIds.push(service.id);
        ownerMap.set(ownerId, owner);
      });

      const owners = Array.from(ownerMap.values());
      return res.json({ owners, total: owners.length });
    }

    // Firestore already filtered server-side above; no need for duplicate client-side filtering

    return res.json({ services, total: services.length });
  } catch (err) {
    console.error('Get services error:', err);
    return res.status(500).json({ error: 'Failed to fetch services.', details: err.message });
  }
};

/**
 * GET /api/services/:id
 */
export const getServiceById = async (req, res) => {
  try {
    const doc = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    return res.json({ service: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error('Get service error:', err);
    return res.status(500).json({ error: 'Failed to fetch service.', details: err.message });
  }
};

/**
 * PUT /api/services/:id
 */
export const updateService = async (req, res) => {
  try {
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const existingService = doc.data();
    const role = req.user?.role || 'user';
    if (role === 'owner' && existingService.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Owners can only edit their own services.' });
    }

    // Handle possible file uploads (coverImage) similar to createService
    let coverImageUrl = '';

    if (req.files) {
      const uploads = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const file of uploads) {
        let publicUrl;

        try {
          const remotePath = `services/${Date.now()}_${file.originalname}`;
          const blob = bucket.file(remotePath);
          await blob.save(file.buffer, {
            metadata: { contentType: file.mimetype },
          });
          await blob.makePublic();
          publicUrl = `https://storage.googleapis.com/${bucket.name}/${remotePath}`;
        } catch (uploadErr) {
          console.warn(`Image upload failed during update, storing inline image fallback: ${uploadErr.message}`);
          publicUrl = fileToDataUrl(file);
        }

        if (file.fieldname === 'coverImage') {
          coverImageUrl = publicUrl;
        }
        // other file fields (gallery) removed/ignored
      }
    }

    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    if (updates.price) updates.price = Number(updates.price);
    if (updates.discount) updates.discount = Number(updates.discount);
    if (updates.status) updates.status = normalizeStatus(updates.status);
    if (typeof updates.facilities === 'string') updates.facilities = JSON.parse(updates.facilities);

    // Merge uploaded images
    if (coverImageUrl) updates.coverImage = coverImageUrl;
    // gallery handling removed

    await ref.update(updates);

    const updatedDoc = await ref.get();
    return res.json({ message: 'Service updated.', service: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    console.error('Update service error:', err);
    return res.status(500).json({ error: 'Failed to update service.', details: err.message });
  }
};

/**
 * DELETE /api/services/:id
 */
export const deleteService = async (req, res) => {
  try {
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const existingService = doc.data();
    const role = req.user?.role || 'user';
    if (role === 'owner' && existingService.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Owners can only delete their own services.' });
    }

    await ref.delete();
    return res.json({ message: 'Service deleted.' });
  } catch (err) {
    console.error('Delete service error:', err);
    return res.status(500).json({ error: 'Failed to delete service.', details: err.message });
  }
};
