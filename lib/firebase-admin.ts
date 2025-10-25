import * as admin from 'firebase-admin';

// Initialize Firebase Admin only if credentials are available
let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    adminAuth = admin.auth();
    adminDb = admin.firestore();
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
} else if (admin.apps.length > 0) {
  // Use existing app
  adminAuth = admin.auth();
  adminDb = admin.firestore();
}

export { adminAuth, adminDb };
