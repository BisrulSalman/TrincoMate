const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8081;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change-me-to-secure-token';

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Simple in-memory storage
let reviews = [];
let nextId = 1;

// Rate limit for POST /api/reviews: 5 per hour per IP
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reviews from this IP, try again later' }
});

function isGmail(email) {
  return typeof email === 'string' && /@gmail\.com\s*$/i.test(email.trim());
}

app.post('/api/reviews', postLimiter, (req, res) => {
  const { name, email, rating, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
  if (!isGmail(email)) return res.status(400).json({ error: 'Only Gmail addresses are allowed' });
  const r = {
    id: String(nextId++),
    name: name.trim(),
    email: email.trim(),
    rating: Number(rating) || 0,
    message: message.trim(),
    approved: false,
    createdAt: new Date().toISOString()
  };
  reviews.unshift(r);
  res.status(201).json(r);
});

app.get('/api/reviews', (req, res) => {
  const adminToken = req.header('X-Admin-Token');
  if (adminToken && adminToken === ADMIN_TOKEN) {
    return res.json(reviews);
  }
  const approved = reviews.filter(r => r.approved);
  res.json(approved);
});

app.put('/api/reviews/:id/approve', (req, res) => {
  const adminToken = req.header('X-Admin-Token');
  if (!adminToken || adminToken !== ADMIN_TOKEN) return res.status(403).json({ error: 'Forbidden' });
  const id = req.params.id;
  const idx = reviews.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  reviews[idx].approved = true;
  return res.json(reviews[idx]);
});

app.delete('/api/reviews/:id', (req, res) => {
  const adminToken = req.header('X-Admin-Token');
  if (!adminToken || adminToken !== ADMIN_TOKEN) return res.status(403).json({ error: 'Forbidden' });
  const id = req.params.id;
  const idx = reviews.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = reviews.splice(idx, 1)[0];
  return res.json({ success: true, removed });
});

app.listen(PORT, () => {
  console.log(`Mock Reviews API running on http://localhost:${PORT}/api`);
  console.log(`Admin token (dev) = ${ADMIN_TOKEN}`);
});
