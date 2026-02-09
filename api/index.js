import express from "express";
import crypto from "crypto";
import multer from "multer";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query as firestoreQuery,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtnuJNgy2Yhs2bgr0GNEI-x_p5gosWcTo",
  authDomain: "mortasa.firebaseapp.com",
  projectId: "mortasa",
  storageBucket: "mortasa.firebasestorage.app",
  messagingSenderId: "884554528405",
  appId: "1:884554528405:web:ecbbb43e14d08cee9e8d9c",
  measurementId: "G-6ZWRBXWYTX",
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseStorage = getStorage(firebaseApp);
const db = getFirestore(firebaseApp);

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("نوع الملف غير مدعوم"));
    }
  },
});

async function uploadToFirebase(fileBuffer, mimetype, originalname) {
  const uniqueName =
    Date.now() +
    "-" +
    Math.round(Math.random() * 1e9) +
    "-" +
    (originalname || "image");
  const storageRef = ref(firebaseStorage, `products/${uniqueName}`);
  const metadata = { contentType: mimetype };
  await uploadBytes(storageRef, fileBuffer, metadata);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

function docToProduct(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name,
    category: data.category,
    price: data.price,
    rating: data.rating ?? 5,
    image: data.image,
    images: data.images ?? null,
    description: data.description,
    isNew: data.isNew ?? false,
    inStock: data.inStock !== false,
    sizes: data.sizes ?? null,
  };
}

const adminSessions = new Map();
const SESSION_TTL = 24 * 60 * 60 * 1000;

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function ensureMasterAdmin() {
  const codesRef = collection(db, "admin_codes");
  const q = firestoreQuery(codesRef, where("isMaster", "==", true), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    const masterCode = process.env.ADMIN_MASTER_CODE || "ZXCVBNMLL22";
    await addDoc(codesRef, {
      code: masterCode,
      label: "المدير الرئيسي",
      isMaster: true,
      createdAt: new Date().toISOString(),
    });
  }
}

let initialized = false;
app.use(async (req, res, next) => {
  if (!initialized) {
    try {
      await ensureMasterAdmin();
      initialized = true;
    } catch (e) {
      console.error("Firebase init error:", e.message);
    }
  }
  next();
});

async function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  const session = adminSessions.get(token);
  if (!session || Date.now() - session.createdAt > SESSION_TTL) {
    adminSessions.delete(token);
    return res.status(401).json({ error: "انتهت صلاحية الجلسة" });
  }
  try {
    const codesRef = collection(db, "admin_codes");
    const q = firestoreQuery(codesRef, where("code", "==", session.code), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      adminSessions.delete(token);
      return res.status(401).json({
        error: "تم إلغاء صلاحيتك من قبل المدير الرئيسي",
        revoked: true,
      });
    }
  } catch (e) {}
  req.adminSession = session;
  next();
}

function requireMaster(req, res, next) {
  if (!req.adminSession?.isMaster)
    return res.status(403).json({ error: "صلاحية المدير الرئيسي فقط" });
  next();
}

app.get("/api/products", async (_req, res) => {
  try {
    const snap = await getDocs(collection(db, "products"));
    const products = snap.docs.map(docToProduct);
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const docRef = doc(db, "products", req.params.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists())
      return res.status(404).json({ message: "المنتج غير موجود" });
    res.json(docToProduct(docSnap));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      rating,
      image,
      images,
      description,
      isNew,
      inStock,
      sizes,
    } = req.body;
    const productData = {
      name,
      category,
      price,
      rating: rating || 5,
      image,
      images: images || null,
      description,
      isNew: isNew || false,
      inStock: inStock !== false,
      sizes: sizes || null,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, "products"), productData);
    res.status(201).json({ id: docRef.id, ...productData });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const docRef = doc(db, "products", req.params.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists())
      return res.status(404).json({ message: "المنتج غير موجود" });

    const updateData = {};
    const allowedFields = [
      "name",
      "category",
      "price",
      "rating",
      "image",
      "images",
      "description",
      "isNew",
      "inStock",
      "sizes",
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0)
      return res.status(400).json({ error: "لا توجد بيانات للتحديث" });

    await updateDoc(docRef, updateData);
    const updated = await getDoc(docRef);
    res.json(docToProduct(updated));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const docRef = doc(db, "products", req.params.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists())
      return res.status(404).json({ message: "المنتج غير موجود" });
    await deleteDoc(docRef);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code)
      return res.status(400).json({ error: "الرجاء إدخال رمز الدخول" });

    const codesRef = collection(db, "admin_codes");
    const q = firestoreQuery(codesRef, where("code", "==", code), limit(1));
    const snap = await getDocs(q);

    if (snap.empty)
      return res.status(401).json({ error: "رمز الدخول غير صحيح" });

    const adminCode = snap.docs[0].data();
    const token = generateToken();
    adminSessions.set(token, {
      token,
      isMaster: adminCode.isMaster,
      label: adminCode.label,
      code: adminCode.code,
      createdAt: Date.now(),
    });
    res.json({
      success: true,
      token,
      isMaster: adminCode.isMaster,
      label: adminCode.label,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/codes", requireAdmin, requireMaster, async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "admin_codes"));
    const codes = snap.docs.map((d) => ({
      id: d.id,
      code: d.data().code,
      label: d.data().label,
      isMaster: d.data().isMaster,
      createdAt: d.data().createdAt,
    }));
    res.json(codes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/codes", requireAdmin, requireMaster, async (req, res) => {
  try {
    const { code, label } = req.body;
    if (!code || !label)
      return res.status(400).json({ error: "الرجاء إدخال الرمز والاسم" });

    const codesRef = collection(db, "admin_codes");
    const q = firestoreQuery(codesRef, where("code", "==", code), limit(1));
    const existing = await getDocs(q);
    if (!existing.empty)
      return res.status(409).json({ error: "هذا الرمز مستخدم بالفعل" });

    const docRef = await addDoc(codesRef, {
      code,
      label,
      isMaster: false,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({
      id: docRef.id,
      code,
      label,
      isMaster: false,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete(
  "/api/admin/codes/:id",
  requireAdmin,
  requireMaster,
  async (req, res) => {
    try {
      const docRef = doc(db, "admin_codes", req.params.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists())
        return res.status(404).json({ error: "الرمز غير موجود" });
      if (docSnap.data().isMaster)
        return res
          .status(403)
          .json({ error: "لا يمكن حذف الرمز الرئيسي" });

      const deletedCode = docSnap.data().code;
      await deleteDoc(docRef);
      for (const [token, session] of adminSessions) {
        if (session.code === deletedCode) adminSessions.delete(token);
      }
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

app.get("/api/messages", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "messages"));
    const messages = snap.docs.map((d) => ({
      id: d.id,
      content: d.data().content,
      isSystem: d.data().isSystem || false,
    }));
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { content, isSystem } = req.body;
    const docRef = await addDoc(collection(db, "messages"), {
      content,
      isSystem: isSystem || false,
      createdAt: new Date().toISOString(),
    });
    res
      .status(201)
      .json({ id: docRef.id, content, isSystem: isSystem || false });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (req.file) {
      const url = await uploadToFirebase(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
      return res.json({ url });
    }
    if (req.body && req.body.imageUrl) {
      return res.json({ url: req.body.imageUrl });
    }
    res.status(400).json({ error: "لم يتم رفع أي صورة" });
  } catch (e) {
    console.error("Upload error:", e);
    res.status(500).json({ error: "فشل رفع الصورة: " + e.message });
  }
});

app.post(
  "/api/upload-multiple",
  upload.array("images", 10),
  async (req, res) => {
    try {
      const files = req.files;
      if (files && files.length > 0) {
        const urls = await Promise.all(
          files.map((file) =>
            uploadToFirebase(file.buffer, file.mimetype, file.originalname)
          )
        );
        return res.json({ urls });
      }
      if (req.body && req.body.imageUrls) {
        return res.json({ urls: req.body.imageUrls });
      }
      res.json({ urls: [] });
    } catch (e) {
      console.error("Multi upload error:", e);
      res.status(500).json({ error: "فشل رفع الصور: " + e.message });
    }
  }
);

export default app;
