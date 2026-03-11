# تعليمات تشغيل الموقع

## المتطلبات
- Node.js 18 أو أحدث
- حساب Firebase (Firestore مفعّل)

## خطوات التثبيت

### 1. تثبيت المكتبات
```
npm install
```

### 2. إعداد المتغيرات البيئية
أنشئ ملف `.env` في جذر المشروع وأضف:

```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
SESSION_SECRET=اكتب_هنا_كلمة_سر_عشوائية_طويلة
```

**للحصول على FIREBASE_SERVICE_ACCOUNT_JSON:**
- افتح Firebase Console → Project Settings → Service accounts
- اضغط "Generate new private key"
- انسخ محتوى ملف JSON كاملاً في المتغير

### 3. بناء الموقع (للإنتاج)
```
npm run build
npm run start
```

### 4. تشغيل للتطوير
```
npm run dev
```

## الموقع يعمل على المنفذ 5000
