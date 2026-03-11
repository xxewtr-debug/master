# Replit.md

## Overview

This is **Mortada Dubai** (مرتضى دبي) — a luxury shoe e-commerce storefront targeted at Arabic-speaking customers in Iraq and the Gulf region. The app presents a dark, gold-accented premium UI with full RTL (right-to-left) Arabic support.

Key features include:
- Public storefront: hero section, product catalog with filtering/sorting, product details with image carousel, contact info
- Shopping cart with toast notifications
- Admin panel (accessed via `/admin` URL) with authentication via admin codes, product management (add/edit/delete), and system messages
- Image upload pipeline with server-side compression (via `sharp`) and storage in Firebase Firestore as base64

The project is a monorepo with a shared `schema.ts` defining all data types.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend (`client/`)
- **Framework**: React (no router library — uses custom `Page` state for navigation between views)
- **Build tool**: Vite with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS with a custom dark luxury theme (navy + gold color palette), CSS variables for theming
- **Component library**: shadcn/ui (New York style) built on Radix UI primitives
- **State management**: Plain React `useState` — no Redux or Zustand. TanStack React Query is included for data fetching utilities but the primary data flow is through props passed from `App.tsx`
- **Arabic support**: Cairo and Cinzel fonts from Google Fonts, RTL layout utilities built into CSS
- **Navigation**: Single-page app using a `currentPage` state variable (`'home' | 'products' | 'about' | 'contact' | 'product-details' | 'admin'`). The `/admin` path is detected from `window.location.pathname` on load
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (`server/`)
- **Framework**: Express.js running on Node.js with TypeScript via `tsx`
- **API**: REST endpoints defined in `server/routes.ts`, with route contracts declared in `shared/routes.ts` using Zod schemas
- **Authentication**: Custom token-based admin session system using an in-memory `Map<string, AdminSession>` with a 24-hour TTL. No third-party auth library
- **Image handling**: Uploaded images are compressed to WebP at 900×900 max using `sharp`, then stored as base64 strings in Firestore (not Firebase Storage bucket despite the bucket being initialized)
- **Dev server**: Vite middleware is mounted inside Express during development for HMR

### Shared (`shared/`)
- **Schema**: All data models defined with Zod in `shared/schema.ts` — `Product`, `Message`, `AdminCode`. No Drizzle/SQL schema here despite drizzle config existing (the actual runtime storage is Firestore)
- **Route contracts**: `shared/routes.ts` declares API shape (method, path, input/output Zod schemas)

### Data Storage
- **Primary database**: Firebase Firestore (NoSQL) via `firebase-admin` SDK
  - Collections: `products`, `messages`, `adminCodes`, `images`
  - Images stored as base64 documents in the `images` collection
- **No SQL database in use at runtime** despite `drizzle.config.ts` and `DATABASE_URL` references existing in the codebase — these appear to be scaffolding remnants
- **In-memory session store**: Admin sessions live only in process memory (`adminSessions` Map)

### Build
- Client built with `vite build` → outputs to `dist/public/`
- Server bundled with `esbuild` → outputs `dist/index.cjs`
- Key server dependencies are bundled (allowlist in `script/build.ts`); others are kept external

---

## External Dependencies

### Firebase
- **firebase-admin** (server): Firestore document storage for all data + image base64 storage
- **firebase** (client): Firebase Analytics tracking
- **Config**: `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable must contain the full Firebase service account JSON
- Firebase project: `mortasa` (hardcoded in `client/src/lib/firebase.ts`)

### Image Processing
- **sharp**: Server-side image compression — resizes uploads to 900×900, converts to WebP at 65% quality before storing in Firestore

### UI & Component Libraries
- **Radix UI**: Full suite of accessible primitives (accordion, dialog, select, toast, etc.)
- **shadcn/ui**: Component layer on top of Radix with Tailwind styling
- **Lucide React**: Icon set used throughout
- **Embla Carousel**: Used in product image carousels
- **Recharts**: Charting library (included but usage not visible in reviewed files)
- **TanStack React Query**: HTTP data fetching with caching

### Fonts
- **Google Fonts**: Cairo (primary Arabic font), Cinzel (decorative), DM Sans, Architects Daughter, Fira Code, Geist Mono

### Form Handling
- **React Hook Form** + **@hookform/resolvers** + **Zod**: Form validation pipeline

### Validation
- **Zod**: Used for both runtime validation and TypeScript type inference throughout shared schema and API contracts
- **drizzle-zod**: Included as a dependency but not actively used (Drizzle is not the active ORM)

### File Upload
- **Multer**: Handles multipart form data for image uploads (using memory storage in current version)

### Environment Variables Required
- `FIREBASE_SERVICE_ACCOUNT_JSON`: Full Firebase Admin SDK service account JSON string
- `DATABASE_URL`: Referenced in `drizzle.config.ts` but not used at runtime (Firestore is the actual DB)