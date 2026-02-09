
import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

interface AdminSession {
  token: string;
  isMaster: boolean;
  label: string;
  code: string;
  createdAt: number;
}

const adminSessions = new Map<string, AdminSession>();
const SESSION_TTL = 24 * 60 * 60 * 1000;

function cleanExpiredSessions() {
  const now = Date.now();
  adminSessions.forEach((session, token) => {
    if (now - session.createdAt > SESSION_TTL) {
      adminSessions.delete(token);
    }
  });
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-admin-token'] as string;
  if (!token) return res.status(401).json({ error: 'غير مصرح' });
  const session = adminSessions.get(token);
  if (!session || Date.now() - session.createdAt > SESSION_TTL) {
    adminSessions.delete(token);
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة' });
  }
  const codeStillValid = await storage.validateAdminCode(session.code);
  if (!codeStillValid) {
    adminSessions.delete(token);
    return res.status(401).json({ error: 'تم إلغاء صلاحيتك من قبل المدير الرئيسي', revoked: true });
  }
  (req as any).adminSession = session;
  next();
}

function requireMaster(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).adminSession as AdminSession;
  if (!session?.isMaster) return res.status(403).json({ error: 'صلاحية المدير الرئيسي فقط' });
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  const express = await import('express');
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  }, express.default.static(uploadsDir));

  app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم رفع أي صورة' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  });

  app.post('/api/upload-multiple', upload.array('images', 10), (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'لم يتم رفع أي صور' });
    }
    const urls = files.map(file => `/uploads/${file.filename}`);
    res.json({ urls });
  });
  
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get('/api/products/:id', async (req, res) => {
    const id = req.params.id;
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    res.json(product);
  });

  app.post(api.products.create.path, requireAdmin, async (req, res) => {
    const input = api.products.create.input.parse(req.body);
    const product = await storage.createProduct(input);
    res.status(201).json(product);
  });

  app.put('/api/products/:id', requireAdmin, async (req, res) => {
    const id = req.params.id as string;
    const input = api.products.update.input.parse(req.body);
    const product = await storage.updateProduct(id, input);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    res.json(product);
  });

  app.delete(api.products.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteProduct(req.params.id as string);
    res.status(204).end();
  });

  app.get(api.messages.list.path, async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post(api.messages.create.path, async (req, res) => {
    const input = api.messages.create.input.parse(req.body);
    const message = await storage.createMessage(input);
    res.status(201).json(message);
  });

  // --- Admin Auth ---
  app.post('/api/admin/login', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'الرجاء إدخال رمز الدخول' });
    const adminCode = await storage.validateAdminCode(code);
    if (!adminCode) return res.status(401).json({ error: 'رمز الدخول غير صحيح' });
    
    cleanExpiredSessions();
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, {
      token,
      isMaster: adminCode.isMaster ?? false,
      label: adminCode.label,
      code: code,
      createdAt: Date.now()
    });
    
    res.json({ success: true, token, isMaster: adminCode.isMaster, label: adminCode.label });
  });

  // --- Admin Codes (Master Only) ---
  app.get('/api/admin/codes', requireAdmin, requireMaster, async (req, res) => {
    const codes = await storage.getAdminCodes();
    res.json(codes);
  });

  app.post('/api/admin/codes', requireAdmin, requireMaster, async (req, res) => {
    const { code, label } = req.body;
    if (!code || !label) return res.status(400).json({ error: 'الرجاء إدخال الرمز والاسم' });
    try {
      const adminCode = await storage.createAdminCode({ code, label, isMaster: false });
      res.status(201).json(adminCode);
    } catch (err: any) {
      if (err.message?.includes('unique') || err.code === '23505') {
        return res.status(409).json({ error: 'هذا الرمز مستخدم بالفعل' });
      }
      return res.status(500).json({ error: 'حدث خطأ أثناء إضافة الرمز' });
    }
  });

  app.delete('/api/admin/codes/:id', requireAdmin, requireMaster, async (req, res) => {
    const id = req.params.id as string;
    const codes = await storage.getAdminCodes();
    const codeToDelete = codes.find(c => c.id === id);
    if (!codeToDelete) return res.status(404).json({ error: 'الرمز غير موجود' });
    if (codeToDelete.isMaster) return res.status(403).json({ error: 'لا يمكن حذف الرمز الرئيسي' });
    await storage.deleteAdminCode(id);
    adminSessions.forEach((session, token) => {
      if (session.code === codeToDelete.code) {
        adminSessions.delete(token);
      }
    });
    res.status(204).end();
  });

  // Seed master admin code if not exists
  const existingCodes = await storage.getAdminCodes();
  const hasMaster = existingCodes.some(c => c.isMaster);
  if (!hasMaster) {
    await storage.createAdminCode({ code: 'ZXCVBNMLL22', label: 'المدير الرئيسي', isMaster: true });
  }

  return httpServer;
}
