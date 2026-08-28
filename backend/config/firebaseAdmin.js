const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let firebaseApp = null;
let db = null;
let auth = null;
let storage = null;

try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
    ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : path.resolve(__dirname, '../../serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
    });
    console.log('[FirebaseAdmin] Initialized successfully with serviceAccountKey.json');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('[FirebaseAdmin] Initialized successfully with environment credentials');
  } else {
    console.warn('[FirebaseAdmin] Warning: No serviceAccountKey.json or credentials provided in .env.');
    console.warn('[FirebaseAdmin] Server will start in standalone/simulation mode for Firebase operations.');
  }

  if (firebaseApp) {
    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();
  }
} catch (error) {
  console.error('[FirebaseAdmin] Initialization error:', error.message);
}

module.exports = {
  admin,
  firebaseApp,
  db,
  auth,
  storage
};
