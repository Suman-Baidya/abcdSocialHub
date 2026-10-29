# ABCD Social Hub — Step-by-Step Execution Plan (Start Here Tomorrow)

**Project:** ABCD Social Hub  
**Date Updated:** 28 October 2026 (Night Handover)  
**Status:** Phases 0 through 8 Completed & Verified ✅  
**Active Git Branch:** `main` (tracked at `https://github.com/Suman-Baidya/abcdSocialHub.git`)  
**Target Environment:** Single Low-Cost VPS via Dokploy (Hetzner / Contabo) + Neon Serverless PostgreSQL  

---

## 🎯 Current Progress Status

| Phase | Description | Status | Verification Reference |
|---|---|:---:|---|
| **Phase 0** | Monorepo scaffolding, Dokploy `docker-compose.yml`, `tokens.css`, `schema.prisma`, Next.js landing page | ✅ **COMPLETED** | Commit `6fba893` |
| **Phase 1** | Database & Tenancy Layer (Neon PostgreSQL 16 + Prisma Client + `createTenantRepository`) | ✅ **COMPLETED** | Verified via test script |
| **Phase 2** | Authentication, RBAC & Glassmorphism Dashboard Shell (NextAuth + Google OAuth + Mobile Dock) | ✅ **COMPLETED** | Commit `f10d540` |
| **Phase 3** | Python Worker & Bengali Poster Studio (FastAPI :8000, Pillow, Edge-TTS audio, Cloudinary CDN) | ✅ **COMPLETED** | Live on port 8000 |
| **Phase 4** | Content Studio & 4-Platform Copywriter (Groq, NVIDIA NIM, OpenRouter, Turnitout anti-slop, Speech mic) | ✅ **COMPLETED** | Commit `d9016e3` |
| **Phase 5** | Mobile Magic-Link Approval Engine (`/approve/[token]` 360px mobile UX, SHA-256 tokens) | ✅ **COMPLETED** | `test:approval` passed |
| **Phase 6** | `pg-boss` Publishing Queue & Meta Graph API (AES-256 tokens, 2-step Instagram containers) | ✅ **COMPLETED** | `test:publish` passed |
| **Phase 7** | India Billing & Subscriptions (`/billing`, Razorpay test checkout, sovereign UPI QR, append ledger) | ✅ **COMPLETED** | `test:billing` passed |
| **Phase 8** | Founder Marketing Cockpit (`/admin/marketing`: OSM B2B prospector, code storyteller, margin ledger) | ✅ **COMPLETED** | Commit `18f8e28` |
| **Phase 8.5** | User Dashboard Upgrades (`/dashboard`: Autopilot Briefing, Channel Health, Quota Ring, Feed) | ✅ **COMPLETED** | Verified via typecheck & test suites |
| **Phase 9** | Security Auditing, Tenant Isolation Tests & Error Recovery Hardening | ⏳ **UP NEXT** | Ready for execution |
| **Phase 10** | Dokploy Single-VPS Production Deployment & Automated Cloudflare R2 Backups | 📋 Planned | Planned |

---

## 🚀 User Dashboard Upgrades (`/dashboard`) — COMPLETED ✅

The **User Dashboard (`/dashboard`)** has been upgraded to a world-class, report-first, and highly actionable control room for Indian business owners and creators.

### 📋 Detailed Dashboard Upgrade Blueprint

#### 1. Autopilot Report Overhaul (`apps/web/app/(dashboard)/dashboard/page.tsx`)
In accordance with `AGENTS.md` ("Report-first: the home screen is the Autopilot Report"):
- **Daily Executive Briefing Banner**:
  - Live AI greeting ("Good morning, Salon De Royal! Today your autopilot created 2 posts and collected 4 leads").
  - 3 Core Stat Pills:
    - **What AI Did Today** (e.g., 2 posters synthesized in Bengali/English).
    - **What's Scheduled Next** (e.g., Instagram Reel scheduled for 6:30 PM IST).
    - **Action Required** (e.g., 1 post waiting for mobile approval with direct magic link).
- **Interactive Quick-Action Dock**:
  - ⚡ **"1-Tap Festive Offer"**: Opens a mini composer with pre-filled regional offers (Durga Puja, Diwali, Weekend Flash).
  - 🎙️ **"Voice Memo Brief"**: Tap to speak an offer in Bengali or English directly from the dashboard.
  - 📲 **"Send WhatsApp Approval"**: Dispatches the magic approval link to the client phone instantly.

#### 2. Live Channel Health & Connection Widget
- Visual indicators showing connection status for all 4 channels:
  - Facebook Page (Connected / Needs Reconnect)
  - Instagram Professional (Connected / Active container)
  - LinkedIn & X (Twitter)
- One-tap "Connect" or "Refresh Token" modal trigger.

#### 3. Real-Time Creative Carousel & Recent Posts Feed
- Visual grid/carousel of the latest 6 posts generated for the active workspace:
  - 1080×1080 poster thumbnail from Cloudinary CDN.
  - Platform badges (IG, FB, LI, X).
  - Status pills: `PUBLISHED` (emerald), `SCHEDULED` (sky blue), `IN_REVIEW` (amber).
  - Quick action: Preview modal, Copy caption, or Re-schedule.

#### 4. Live Credit Quota & Usage Ring
- Circular SVG progress meter displaying remaining monthly credits (connected live to the newly created `/api/billing` endpoint).
- 1-click "Top-Up Credits" button opening the Razorpay/UPI modal.

#### 5. Four Required UI States (Non-negotiable as per `AGENTS.md`)
- **Loading State**: Premium shimmer skeleton with cards, meters, and recent post placeholders.
- **Empty State**: Welcoming zero-state for new workspaces with a prominent *"Generate Your First Poster in 30 Seconds"* button.
- **Error State**: Graceful error card with retry action.
- **No-Permission State**: Clean guard for restricted guest roles.

---

## 🛠️ Active Environment & Service Ports

| Service | Port / URL | Status | Launch Command |
|---|---|---|---|
| **Next.js Web App** | `http://localhost:3000` | Running (`task-1055`) | `pnpm --filter @abcd/web dev` |
| **Python FastAPI Worker** | `http://localhost:8000` | Running (`task-519`) | `cd apps/python-worker; .venv\Scripts\python main.py` |
| **Neon PostgreSQL Database** | Serverless AWS Singapore | Active | Pooled: `DATABASE_URL`, Direct: `DIRECT_URL` |
| **Razorpay Payments** | Live Test Mode | Verified | Key: `rzp_test_TtPaVvCeFmoKOR` (in `.env`) |

---

## 🧪 Verification Commands To Run Tomorrow

```bash
# 1. Typecheck the entire monorepo
pnpm --filter @abcd/web typecheck
pnpm --filter @abcd/db typecheck
pnpm --filter @abcd/integrations typecheck

# 2. Run existing integration test suites
pnpm --filter @abcd/db run test:approval   # Tests mobile magic-link
pnpm --filter @abcd/db run test:publish    # Tests pg-boss queue & AES-256 tokens
pnpm --filter @abcd/db run test:billing    # Tests Razorpay HMAC & credit ledger

# 3. Production build test
pnpm --filter @abcd/web build
```

---

## 🔑 Important Reminders & Anti-Confusion Notes
- **Never Hardcode Secrets**: All API keys (Groq, NVIDIA, Cloudinary, Razorpay, NextAuth) must remain strictly in `.env` and `.env.local`. Both are git-ignored.
- **Strict Tenancy**: Every new query in `/dashboard` must call `createTenantRepository(workspaceId)`. Never call raw Prisma queries directly in routes.
- **Design System Tokens**: Use tokens in `packages/ui/styles/tokens.css` (Background: `#0A0D14`, Card: `#121722`, Accent: `#00F0FF`, Text: `zinc-100`/`zinc-400`).
- **Responsive Viewport**: All dashboard widgets must be tested and responsive down to 360px mobile viewport with touch targets $\ge$ 44px.
