// ─────────────────────────────────────────────────────────
//  Firebase Admin SDK — initialised once, exported everywhere
// ─────────────────────────────────────────────────────────
import admin from 'firebase-admin';

// Choose credential strategy based on what .env provides
let db, auth, bucket;

try {
  let credential;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = admin.credential.applicationDefault();
  } else if (process.env.FIREBASE_PRIVATE_KEY) {
    credential = admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  } else {
    throw new Error('No Firebase credentials found in .env');
  }

  admin.initializeApp({
    credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
  db = admin.firestore();
  auth = admin.auth();
  bucket = admin.storage().bucket();
  console.log('✅ Firebase Admin Initialized');
} catch (error) {
  console.warn(`⚠️ Firebase Admin Initialization Failed: ${error.message}`);
  console.warn('⚠️ Server will run, but database calls will fail until real keys are provided.');
  db = { collection: () => ({ doc: () => ({ get: () => ({ exists: false }) }) }) };
  auth = {};
  bucket = {};
}

export { admin, db, auth, bucket };
export default admin;
