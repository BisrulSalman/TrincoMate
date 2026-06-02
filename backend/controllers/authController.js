import jwt from 'jsonwebtoken';
import { db } from '../config/firebaseAdmin.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-dev-secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@trincomate.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

const signToken = (user) => jwt.sign(user, JWT_SECRET, { expiresIn: '1d' });

const publicOwner = (doc) => {
  const { passwordHash, ...owner } = doc;
  return owner;
};

const publicUser = (doc) => {
  const { passwordHash, ...user } = doc;
  return user;
};

export const register = async (req, res) => {
  try {
    const { role, password, confirmPassword } = req.body;
    if (!['owner', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Register as Owner or User.' });
    }
    if (!password || password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const collectionName = role === 'owner' ? 'owners' : 'users';
    const existing = await db.collection(collectionName).where('email', '==', email).limit(1).get();
    if (!existing.empty) {
      return res.status(409).json({ error: `${role} email is already registered.` });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    if (role === 'owner') {
      const required = ['ownerName', 'serviceName', 'phoneNumber'];
      const missing = required.filter(field => !String(req.body[field] || '').trim());
      if (missing.length) return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });

      const docRef = db.collection('owners').doc();
      const owner = {
        ownerId: docRef.id,
        ownerName: req.body.ownerName.trim(),
        serviceName: req.body.serviceName.trim(),
        email,
        phoneNumber: req.body.phoneNumber.trim(),
        passwordHash,
        status: 'Pending',
        createdAt: now,
      };
      await docRef.set(owner);
      return res.status(201).json({ message: 'Owner registered. Await admin approval.', owner: publicOwner(owner) });
    }

    const required = ['fullName', 'age', 'country', 'whatsappNumber'];
    const missing = required.filter(field => !String(req.body[field] || '').trim());
    if (missing.length) return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });

    const docRef = db.collection('users').doc();
    const user = {
      userId: docRef.id,
      fullName: req.body.fullName.trim(),
      age: Number(req.body.age),
      country: req.body.country.trim(),
      whatsappNumber: req.body.whatsappNumber.trim(),
      email,
      passwordHash,
      createdAt: now,
    };
    await docRef.set(user);
    const tokenUser = { uid: user.userId, email: user.email, role, name: user.fullName };
    return res.status(201).json({
      message: 'User registered successfully.',
      token: signToken(tokenUser),
      user: publicUser(user),
      role,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed.', details: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { loginAs, password } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();
    
    console.log('🔐 Login attempt:', { email, loginAs, passwordProvided: !!password });
    
    if (!email || !password || !loginAs) {
      console.warn('❌ Missing fields:', { hasEmail: !!email, hasPassword: !!password, hasLoginAs: !!loginAs });
      return res.status(400).json({ error: 'Email, password, and role are required.' });
    }

    if (loginAs === 'admin') {
      console.log('🔑 Admin login attempt - checking credentials');
      console.log('Expected email:', ADMIN_EMAIL.toLowerCase());
      console.log('Provided email:', email);
      console.log('Password match:', password === ADMIN_PASSWORD);
      
      if (email !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
        console.warn('❌ Invalid admin credentials');
        return res.status(401).json({ error: 'Invalid admin credentials.' });
      }
      const user = { uid: 'admin', email: ADMIN_EMAIL, role: 'admin', name: 'Admin' };
      console.log('✅ Admin login successful');
      return res.json({ message: 'Login successful.', token: signToken(user), user });
    }

    if (!['owner', 'user'].includes(loginAs)) {
      console.warn('❌ Invalid login role:', loginAs);
      return res.status(400).json({ error: 'Invalid login role.' });
    }

    const collectionName = loginAs === 'owner' ? 'owners' : 'users';
    console.log(`🔍 Searching ${collectionName} collection for email:`, email);
    
    const snapshot = await db.collection(collectionName).where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      console.warn(`❌ No ${loginAs} found with email:`, email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const account = snapshot.docs[0].data();
    const validPassword = await verifyPassword(password, account.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password.' });

    if (loginAs === 'owner' && account.status !== 'Approved') {
      return res.status(403).json({ error: 'Owner account is pending admin approval.' });
    }

    const uid = loginAs === 'owner' ? account.ownerId : account.userId;
    const name = loginAs === 'owner' ? account.ownerName : account.fullName;
    const tokenUser = { uid, email: account.email, role: loginAs, name };
    return res.json({
      message: 'Login successful.',
      token: signToken(tokenUser),
      user: loginAs === 'owner' ? publicOwner(account) : publicUser(account),
      role: loginAs,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed.', details: err.message });
  }
};

export const getOwners = async (req, res) => {
  try {
    const snapshot = await db.collection('owners').orderBy('createdAt', 'desc').get();
    const owners = snapshot.docs.map(doc => publicOwner({ ownerId: doc.id, ...doc.data() }));
    return res.json({ owners, total: owners.length });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch owners.', details: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
    const users = snapshot.docs.map(doc => publicUser({ userId: doc.id, ...doc.data() }));
    return res.json({ users, total: users.length });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users.', details: err.message });
  }
};

export const updateOwnerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid owner status.' });
    }
    const ref = db.collection('owners').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Owner not found.' });
    await ref.update({ status, updatedAt: new Date().toISOString() });
    return res.json({ owner: publicOwner({ ownerId: doc.id, ...doc.data(), status }) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update owner.', details: err.message });
  }
};

export const removeOwner = async (req, res) => {
  try {
    const ownerRef = db.collection('owners').doc(req.params.id);
    const doc = await ownerRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Owner not found.' });

    const services = await db.collection('services').where('ownerId', '==', req.params.id).get();
    await Promise.all(services.docs.map(service => service.ref.delete()));
    await ownerRef.delete();
    return res.json({ message: 'Owner removed.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove owner.', details: err.message });
  }
};

export const setUserRole = async (_req, res) => {
  return res.status(410).json({ error: 'Use owner approval and JWT roles instead.' });
};
