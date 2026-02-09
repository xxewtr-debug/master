import express from "express";
import crypto from "crypto";
import pg from "pg";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const { Pool } = pg;
let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

async function query(text, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function ensureTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      rating INTEGER DEFAULT 5,
      image TEXT NOT NULL,
      images TEXT[],
      description TEXT NOT NULL,
      is_new BOOLEAN DEFAULT false,
      in_stock BOOLEAN DEFAULT true,
      sizes INTEGER[]
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      is_system BOOLEAN DEFAULT false
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS admin_codes (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      is_master BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  const { rows } = await query("SELECT id FROM admin_codes WHERE is_master = true LIMIT 1");
  if (rows.length === 0) {
    const masterCode = process.env.ADMIN_MASTER_CODE || "ZXCVBNMLL22";
    await query(
      "INSERT INTO admin_codes (code, label, is_master) VALUES ($1, $2, true) ON CONFLICT (code) DO NOTHING",
      [masterCode, "المدير الرئيسي"]
    );
  }
}

let tablesReady = false;
app.use(async (req, res, next) => {
  if (!tablesReady && process.env.DATABASE_URL) {
    try {
      await ensureTables();
      tablesReady = true;
    } catch (e) {
      console.error("DB setup error:", e.message);
    }
  }
  next();
});

function snakeToCamel(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    rating: row.rating,
    image: row.image,
    images: row.images,
    description: row.description,
    isNew: row.is_new,
    inStock: row.in_stock,
    sizes: row.sizes,
  };
}

const adminSessions = new Map();
const SESSION_TTL = 24 * 60 * 60 * 1000;

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  const session = adminSessions.get(token);
  if (!session || Date.now() - session.createdAt > SESSION_TTL) {
    adminSessions.delete(token);
    return res.status(401).json({ error: "انتهت صلاحية الجلسة" });
  }
  try {
    const { rows } = await query("SELECT * FROM admin_codes WHERE code = $1", [session.code]);
    if (rows.length === 0) {
      adminSessions.delete(token);
      return res.status(401).json({ error: "تم إلغاء صلاحيتك من قبل المدير الرئيسي", revoked: true });
    }
  } catch (e) {}
  req.adminSession = session;
  next();
}

function requireMaster(req, res, next) {
  if (!req.adminSession?.isMaster) return res.status(403).json({ error: "صلاحية المدير الرئيسي فقط" });
  next();
}

app.get("/api/products", async (_req, res) => {
  try {
    const { rows } = await query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows.map(snakeToCamel));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rows } = await query("SELECT * FROM products WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "المنتج غير موجود" });
    res.json(snakeToCamel(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    const { name, category, price, rating, image, images, description, isNew, inStock, sizes } = req.body;
    const { rows } = await query(
      `INSERT INTO products (name, category, price, rating, image, images, description, is_new, in_stock, sizes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, category, price, rating || 5, image, images || null, description, isNew || false, inStock !== false, sizes || null]
    );
    res.status(201).json(snakeToCamel(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const fields = req.body;
    const setClauses = [];
    const values = [];
    let idx = 1;

    const fieldMap = {
      name: "name", category: "category", price: "price", rating: "rating",
      image: "image", images: "images", description: "description",
      isNew: "is_new", inStock: "in_stock", sizes: "sizes"
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (fields[key] !== undefined) {
        setClauses.push(`${col} = $${idx}`);
        values.push(fields[key]);
        idx++;
      }
    }

    if (setClauses.length === 0) return res.status(400).json({ error: "لا توجد بيانات للتحديث" });

    values.push(id);
    const { rows } = await query(
      `UPDATE products SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ message: "المنتج غير موجود" });
    res.json(snakeToCamel(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rowCount } = await query("DELETE FROM products WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ message: "المنتج غير موجود" });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "الرجاء إدخال رمز الدخول" });
    const { rows } = await query("SELECT * FROM admin_codes WHERE code = $1", [code]);
    if (rows.length === 0) return res.status(401).json({ error: "رمز الدخول غير صحيح" });
    const adminCode = rows[0];
    const token = generateToken();
    adminSessions.set(token, {
      token,
      isMaster: adminCode.is_master,
      label: adminCode.label,
      code: adminCode.code,
      createdAt: Date.now(),
    });
    res.json({ success: true, token, isMaster: adminCode.is_master, label: adminCode.label });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/codes", requireAdmin, requireMaster, async (req, res) => {
  try {
    const { rows } = await query("SELECT * FROM admin_codes ORDER BY id");
    res.json(rows.map(r => ({
      id: r.id,
      code: r.code,
      label: r.label,
      isMaster: r.is_master,
      createdAt: r.created_at,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/codes", requireAdmin, requireMaster, async (req, res) => {
  try {
    const { code, label } = req.body;
    if (!code || !label) return res.status(400).json({ error: "الرجاء إدخال الرمز والاسم" });
    const { rows } = await query(
      "INSERT INTO admin_codes (code, label, is_master) VALUES ($1, $2, false) RETURNING *",
      [code, label]
    );
    res.status(201).json({
      id: rows[0].id, code: rows[0].code, label: rows[0].label,
      isMaster: rows[0].is_master, createdAt: rows[0].created_at,
    });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "هذا الرمز مستخدم بالفعل" });
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/codes/:id", requireAdmin, requireMaster, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rows } = await query("SELECT * FROM admin_codes WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "الرمز غير موجود" });
    if (rows[0].is_master) return res.status(403).json({ error: "لا يمكن حذف الرمز الرئيسي" });
    await query("DELETE FROM admin_codes WHERE id = $1", [id]);
    for (const [token, session] of adminSessions) {
      if (session.code === rows[0].code) adminSessions.delete(token);
    }
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/messages", async (req, res) => {
  try {
    const { rows } = await query("SELECT * FROM messages ORDER BY id DESC");
    res.json(rows.map(r => ({ id: r.id, content: r.content, isSystem: r.is_system })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { content, isSystem } = req.body;
    const { rows } = await query(
      "INSERT INTO messages (content, is_system) VALUES ($1, $2) RETURNING *",
      [content, isSystem || false]
    );
    res.status(201).json({ id: rows[0].id, content: rows[0].content, isSystem: rows[0].is_system });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/upload", (req, res) => {
  const imageUrl = req.body.imageUrl || req.body.url;
  if (imageUrl) return res.json({ url: imageUrl });
  res.status(400).json({ error: "الرجاء إرسال رابط الصورة (imageUrl)" });
});

app.post("/api/upload-multiple", (req, res) => {
  const urls = req.body.imageUrls || req.body.urls || [];
  res.json({ urls });
});

export default app;
