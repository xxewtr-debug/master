# Master Store - متجر ماستر للأحذية الفاخرة

متجر إلكتروني للأحذية الفاخرة مع نظام طلب عبر واتساب ولوحة تحكم للمدير.

## المتطلبات

- Node.js 18+
- PostgreSQL

## التثبيت

```bash
npm install
```

## إعداد قاعدة البيانات

أنشئ ملف `.env` في المجلد الرئيسي وأضف:

```
DATABASE_URL=postgresql://username:password@host:5432/database_name
SESSION_SECRET=any_random_secret_string
```

ثم ادفع الجداول لقاعدة البيانات:

```bash
npm run db:push
```

## التشغيل

### وضع التطوير:
```bash
npm run dev
```

### وضع الإنتاج:
```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

## النشر على Render.com

1. ارفع المشروع على GitHub
2. سجل في [Neon.tech](https://neon.tech) وأنشئ قاعدة بيانات PostgreSQL مجانية
3. سجل في [Render.com](https://render.com) واختر **New Web Service**
4. اربط مستودع GitHub
5. اضبط الإعدادات:
   - **Build Command:** `npm install && npm run build && npm run db:push`
   - **Start Command:** `NODE_ENV=production node dist/index.cjs`
6. أضف متغيرات البيئة (Environment Variables):
   - `DATABASE_URL` = رابط قاعدة البيانات من Neon
   - `SESSION_SECRET` = أي نص عشوائي طويل
7. اضغط Deploy

## لوحة التحكم

- الرابط: `/admin`
- رمز المدير الرئيسي: `ZXCVBNMLL22`
