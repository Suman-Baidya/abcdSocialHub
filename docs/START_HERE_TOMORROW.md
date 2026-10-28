# ABCD Social Hub — Step-by-Step Execution Plan (Start Here Tomorrow)

**Project:** ABCD Social Hub  
**Date Created:** 20 October 2026  
**Status:** Phase 0 Complete — Ready for Phase 1  
**Target Environment:** Single Low-Cost VPS via Dokploy (Hetzner / Contabo)  

---

## 🎯 Current Progress Status

| Phase | Description | Status |
|---|---|:---:|
| **Phase 0** | Monorepo scaffolding, Dokploy `docker-compose.yml`, `Product_Blueprint.md`, `tokens.css`, `schema.prisma`, Next.js landing page, FastAPI worker foundation | ✅ **COMPLETED** |
| **Phase 1** | Database & Tenancy Layer (Prisma Client generation & Tenant Repository verification) | ✅ **COMPLETED** |
| **Phase 2** | Authentication, RBAC & Glassmorphism Dashboard Shell | ✅ **COMPLETED** |
| **Phase 3** | Python Worker & Bengali / English Poster Studio (Pillow, Edge-TTS, Cloudinary) | ✅ **COMPLETED** |
| **Phase 4** | Content Studio & 4-Platform Copywriter (Jakeschincariol + Turnitout anti-slop) | ✅ **COMPLETED** |
| **Phase 5** | Mobile Magic-Link Approval Engine (`/approve/[token]` phone UX) | ✅ **COMPLETED** |
| **Phase 6** | `pg-boss` Publishing Queue & Meta Graph API (Facebook Pages & Instagram) | ✅ **COMPLETED** |
| **Phase 7** | India Billing & Subscriptions (Razorpay UPI Autopay / Sovereign UPI QR) | ✅ **COMPLETED** |
| **Phase 8** | Founder Marketing Cockpit (`/admin/marketing`: `brag`, `harvey`, `Wally`) | ✅ **COMPLETED** |
| **Phase 9** | Security Auditing, Tenant Isolation Tests & Error Recovery Hardening | ⏳ **UP NEXT** |
| **Phase 10** | Dokploy Single-VPS Production Deployment & Automated R2 Backup Cron | 📋 Planned |

---

## 🚀 Tomorrow's Starting Point: User Dashboard Upgrades & UX Polish

When you return tomorrow, here is the focus roadmap for upgrading the user dashboard (`/dashboard`):

### 1. Autopilot Report Upgrades (`/dashboard`)
- **Daily Executive Summary**: "What AI Did Today", "What's Scheduled Next", "Requires Your Approval".
- **Quick Action Bar**: "1-Tap Offer Generator", "Record Voice Memo Brief", "Instant WhatsApp Blast".
- **Live Social Health & Metrics**:
  - Connected channels status (FB, IG, LinkedIn, X).
  - Reach, engagement, and click stats.
  - Active brand kit switcher with live preview badge.
- **Recent Post Stream**:
  - Visual grid of recently generated creatives with status tags (Published, Scheduled, In Review).
  - 1-click re-share or send magic approval link.

### 2. Credit Usage & Quota Widget
- Live interactive credits remaining ring/bar connected to the newly verified Razorpay ledger.
- Direct "Top-Up" quick modal trigger.

### 3. Mobile Navigation & Dock Polish
- Ensure 360px viewport perfection for small smartphone screens.
- Haptic-feel micro-interactions and smooth transitions.

---

## 📅 Full Roadmap Breakdown: Phases 1 to 10

### 🔹 Phase 1: Database Layer & Tenancy Model (`packages/db`)
* **Deliverable:** Working typed database connection with strict workspace isolation.
* **Key Tasks:**
  1. Generate Prisma client.
  2. Implement unit test for `createTenantRepository(workspaceId)` ensuring User A cannot read User B's posts.
  3. Validate append-only `UsageLedger` credits deduction.

---

### 🔹 Phase 2: Auth, RBAC & Dashboard Shell (`apps/web`)
* **Deliverable:** Secure login/signup and dark-mode glassmorphism dashboard shell.
* **Key Tasks:**
  1. NextAuth setup with email/password and Google OAuth.
  2. Workspace Switcher (allows agencies to manage multiple business brands).
  3. Reusable UI building blocks: `AppShell`, `PageHeader`, `StatCard`, `DataTable`, `LoadingSkeleton`.
  4. Ensure all 4 UI states exist for every view: Loading, Empty, Error, and No-Permission.

---

### 🔹 Phase 3: Python Worker & Bengali Poster Studio (`apps/python-worker`)
* **Deliverable:** 1080×1080 promotional poster generator with native Bengali text support.
* **Key Tasks:**
  1. FastAPI worker with GNU Cairo and `Noto Sans Bengali` / `Hind Siliguri` fonts.
  2. Canvas template engine: burns business logo, discount badge, phone, and address footer onto creative.
  3. Eliminates broken Bengali font ligatures (*যুক্তাক্ষর*) in under 450ms.
  4. Upload output to Cloudinary / Cloudflare R2 and return signed CDN URL.

---

### 🔹 Phase 4: Content Studio & 4-Platform Copywriter
* **Deliverable:** AI content composer generating tailored copy for IG, FB, LinkedIn, and X.
* **Key Tasks:**
  1. Multi-model prompt composer (integrates `Jakeschincariol` copywriting frameworks).
  2. `Turnitout-Humanizer` pipeline: purges AI buzzwords (*"delve"*, *"testament"*, *"tapestry"*).
  3. Connect prompt output to the Poster Studio so copy and image match the promo brief.
  4. Deduct content credits from workspace `UsageLedger`.

---

### 🔹 Phase 5: Mobile Magic-Link Approval Engine
* **Deliverable:** Zero-login mobile web preview page for business owners.
* **Key Tasks:**
  1. Route `/approve/[token]` optimized for 360px smartphone screens.
  2. SHA-256 token verification with 72-hour expiration.
  3. Displays live poster, channel captions, and scheduled publish time.
  4. Single-tap **"Approve"** or **"Request Changes"** buttons without entering any password.
  5. Dispatches notification link via WhatsApp / Resend Email.

---

### 🔹 Phase 6: `pg-boss` Publishing Queue & Meta Graph API
* **Deliverable:** Automated, reliable publishing to Facebook Pages & Instagram Professional accounts.
* **Key Tasks:**
  1. Initialize `pg-boss` queue tables inside PostgreSQL (`SKIP LOCKED` atomic claiming).
  2. Meta OAuth account connection wizard with AES-256 token encryption.
  3. Official 2-step Instagram container flow (store `container_id` before publishing to prevent duplicate posts).
  4. Exponential backoff with jitter and clear user-facing error banners on expired tokens.

---

### 🔹 Phase 7: India Billing & Subscriptions (Razorpay & YouPI-PG)
* **Deliverable:** Automated monthly subscription collection.
* **Key Tasks:**
  1. Razorpay Subscriptions integration with UPI Autopay and card billing.
  2. Webhook signature verification and automatic plan credit replenishment.
  3. YouPI-PG 0% fee sovereign UPI QR checkout alternative.
  4. Automated GST tax invoice generation.

---

### 🔹 Phase 8: Founder Marketing Cockpit (`/admin/marketing`)
* **Deliverable:** Private Super Admin suite to market ABCD Social Hub while building it.
* **Key Tasks:**
  1. `latent-spaces/brag`: 20s 60FPS code-to-video teasers generated from Git commits.
  2. `CristianOlivera1/openvid`: In-browser 3D screencast demos with zero cloud rendering cost.
  3. `ethanplusai/harvey`: Scrapes local salons/clinics on OpenStreetMap and drafts outreach emails for $0.
  4. `polius/Wally`: Live unit economics ledger tracking gross margin per workspace.

---

### 🔹 Phase 9: Testing, Security & Hardening
* **Deliverable:** Enterprise-grade security and reliability verification.
* **Key Tasks:**
  1. Run `pnpm typecheck`, `pnpm lint`, and `pnpm test`.
  2. Tenant isolation automated test suite.
  3. Rate limiting and CSRF protection on mutating endpoints.
  4. Token encryption zero-leakage verification.

---

### 🔹 Phase 10: Dokploy Production Launch on Single VPS
* **Deliverable:** Live production SaaS on your custom domain with automatic SSL.
* **Key Tasks:**
  1. Connect GitHub repository to Dokploy Compose service.
  2. Input production environment variables.
  3. Verify automatic Traefik SSL certificate provisioning.
  4. Setup daily database backup snapshot cron to Cloudflare R2.

---

## 🔑 Values & Accounts Checklist (When You Need Them)

| Service | Purpose | Needed By | Status |
|---|---|:---:|:---:|
| **PostgreSQL 16** | Database | **Phase 1** | ✅ Handled locally via Docker Compose |
| **OpenAI / DeepSeek** | Text & Copy Generation | **Phase 4** | 📋 Need API key in Phase 4 |
| **Cloudinary** | Image resizing & CDN | **Phase 3** | 📋 Need free account in Phase 3 |
| **Cloudflare R2** | Video storage & backups | **Phase 3** | 📋 Need free account in Phase 3 |
| **Resend** | Magic link emails | **Phase 5** | 📋 Need free account in Phase 5 |
| **Meta for Developers** | FB/IG Graph API | **Phase 6** | 📋 Need free developer app in Phase 6 |
| **Razorpay** | UPI Autopay / Billing | **Phase 7** | 📋 Need test keys in Phase 7 |

---

*Take rest tonight! Everything is saved, documented, and ready for execution tomorrow morning starting at Phase 1.*
