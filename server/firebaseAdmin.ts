import admin from "firebase-admin";

let _firestore: admin.firestore.Firestore | null = null;
let _bucket: any = null;
let _initError: string | null = null;
let _initialized = false;

function initFirebase() {
  if (_initialized) return;
  _initialized = true;
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw || raw.trim() === "" || raw.trim() === "{}") {
      _initError = "FIREBASE_SERVICE_ACCOUNT_JSON غير مضبوط";
      console.error("[Firebase]", _initError);
      return;
    }
    const serviceAccount = JSON.parse(raw);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
      });
    }
    _firestore = admin.firestore();
    try {
      _bucket = admin.storage().bucket();
    } catch {
      _bucket = null;
    }
    console.log("[Firebase] initialized successfully for project:", serviceAccount.project_id);
  } catch (err: any) {
    _initError = err.message;
    console.error("[Firebase] initialization failed:", err.message);
  }
}

export function getFirestore(): admin.firestore.Firestore {
  if (!_initialized) initFirebase();
  if (!_firestore) {
    throw new Error(`Firebase غير متاح: ${_initError || "لم يتم التهيئة"}`);
  }
  return _firestore;
}

export function getBucket(): any {
  if (!_initialized) initFirebase();
  if (!_bucket) throw new Error("Firebase Storage غير متاح");
  return _bucket;
}

export { _initError as firebaseInitError };
