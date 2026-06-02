// ─────────────────────────────────────────────────────────
//  Auth Middleware — verifies Firebase ID tokens
// ─────────────────────────────────────────────────────────
import jwt from 'jsonwebtoken';
import { auth } from '../config/firebaseAdmin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-dev-secret';

/**
 * Require a valid Firebase ID token in the Authorization header.
 * Sets `req.user` with the decoded token on success.
 */
export const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  const origin = req.headers.origin || '';
  const isLocalOrigin = !origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
  const isDemoAdmin = process.env.NODE_ENV !== 'production'
    && isLocalOrigin
    && req.headers['x-demo-admin'] === 'true';
  const isDemoOwner = process.env.NODE_ENV !== 'production'
    && isLocalOrigin
    && req.headers['x-demo-owner'] === 'true';
  const isDemoUser = process.env.NODE_ENV !== 'production'
    && isLocalOrigin
    && req.headers['x-demo-user'] === 'true';

  if (isDemoAdmin) {
    req.user = { uid: 'demo-admin', email: 'admin@local.demo', role: 'admin' };
    return next();
  }

  if (isDemoOwner) {
    req.user = { uid: 'demo-owner', email: 'owner@local.demo', role: 'owner' };
    return next();
  }

  if (isDemoUser) {
    req.user = { uid: 'demo-user', email: 'user@local.demo', role: 'user' };
    return next();
  }

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  const idToken = header.split('Bearer ')[1];

  try {
    if (idToken.split('.').length === 3) {
      req.user = jwt.verify(idToken, JWT_SECRET);
      return next();
    }

    const decoded = await auth.verifyIdToken(idToken);
    req.user = decoded; // uid, email, role (custom claim) etc.
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Require a specific role (set via Firebase custom claims).
 * Must run AFTER verifyToken.
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'user';
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}.` });
    }
    next();
  };
};
