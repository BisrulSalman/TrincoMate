// ─────────────────────────────────────────────────────────
//  Category Controller — CRUD for Firestore 'categories' collection
// ─────────────────────────────────────────────────────────
import { db } from '../config/firebaseAdmin.js';

/**
 * GET /api/categories  — public, returns all categories
 */
export const getCategories = async (req, res) => {
  try {
    const snapshot = await db.collection('categories').orderBy('name').get();
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    return res.status(500).json({ error: 'Failed to fetch categories.', details: err.message });
  }
};

/**
 * POST /api/categories  — admin only
 * Body: { name, description }
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description = 'Tourism category' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }
    const docRef = await db.collection('categories').add({
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json({ id: docRef.id, name: name.trim(), description: description.trim() });
  } catch (err) {
    console.error('Create category error:', err);
    return res.status(500).json({ error: 'Failed to create category.', details: err.message });
  }
};

/**
 * PUT /api/categories/:id  — admin only
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (description) updates.description = description.trim();
    await db.collection('categories').doc(id).update(updates);
    return res.json({ id, ...updates });
  } catch (err) {
    console.error('Update category error:', err);
    return res.status(500).json({ error: 'Failed to update category.', details: err.message });
  }
};

/**
 * DELETE /api/categories/:id  — admin only
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('categories').doc(id).delete();
    return res.json({ message: 'Category deleted.' });
  } catch (err) {
    console.error('Delete category error:', err);
    return res.status(500).json({ error: 'Failed to delete category.', details: err.message });
  }
};
