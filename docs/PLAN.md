# ABCD Social Hub — Master System Design & Implementation Plan

**Prepared:** 20 October 2026  
**Status:** Canonical System Design (`docs/PLAN.md`)  
**Target:** Single VPS Deployment via Dokploy (Hetzner / Contabo)  
**Parent Brand:** ABCD Digital Hub  

---

## 1. Executive Vision & Core Wedge

**ABCD Social Hub** is a marketing-automation SaaS built specifically for Indian local service businesses (salons, clinics, fitness centers, tutors, repair agencies) and creator-led brands. 

### The Core Problem It Solves
Local business owners know they need to publish regularly on Instagram, Facebook, and WhatsApp, but:
1. They don't have hours to write posts or hire expensive agencies.
2. They don't know graphic design and Canva takes too much time.
3. Complex dashboards scare them — they won't log in from a laptop every day.
4. Generic AI outputs look like obvious English AI "slop" that breaks local engagement and cannot render Bengali/Indic scripts properly.

### The 4 Killer Differentiators (The Wedge)
1. **Branded Regional Poster Studio (Bengali & English):** Automatically turns promotional ideas (e.g., *"50% off hair spa for Durga Puja"*) into pixel-perfect 1080×1080 social posters with the business logo, contact number, and address footer banner. Satori + Cairo rendering ensures native Indic font ligatures (*যুক্তাক্ষর*) are rendered flawlessly without broken typography.
2. **Mobile Magic-Link Approval (Zero-Login Phone UX):** Business owners do not need to remember passwords or open a desktop browser. When content is generated, they receive a secure, token-hashed magic link via WhatsApp/Email. They open it on mobile and tap **"Approve"** or **"Request Changes"** in 5 seconds.
3. **4-Platform Copywriting Multiplexer with Anti-AI Slop Humanizer:** Ingests raw promo briefs and creates tailored copy for Instagram, Facebook, LinkedIn, and X using proven hook/retention architectures (`Jakeschincariol/agent-skills`), passed through `Turnitout-Humanizer` to eliminate telltale AI jargon.
4. **Founder Marketing & Dogfooding Cockpit (`/admin/marketing`):** Private Super Admin suite equipping the solo founder to market ABCD Social Hub while building it:
   - `latent-spaces/brag`: 20s 60FPS code-to-video teasers from Git commits.
   - `CristianOlivera1/openvid`: In-browser 3D screencasts for feature releases.
   - `ethanplusai/harvey`: Zero-cost local B2B prospecting to acquire the first 50 clients.
   - `polius/Wally`: Live unit economics and server margin ledger.

---

## 2. Harmonized Technology Stack

To achieve enterprise reliability on a strict solo-founder budget ($10–$14/month single VPS), the system is structured as a **two-service monorepo** managed with Dokploy:

```text
abcd-social-hub/
├── docker-compose.yml              # Dokploy deployment definition
├── .env.example
├── apps/
│   ├── web/                        # Next.js 15/16 App Router (TypeScript)
│   └── python-worker/              # Python 3.11+ FastAPI (Heavy Media & Poster Engine)
├── packages/
│   ├── db/                         # Prisma schema, tenant-scoped client, migrations
│   ├── core/                       # Brand engine, guardrails, credit ledger
│   ├── integrations/               # Meta Graph API, Razorpay, YouPI-PG, Resend
│   └── ui/                         # Design system tokens, glassmorphism components
└── scripts/                        # Automated DB backups & VPS setup
```

### Technology Matrix

| Subsystem | Technology | Operational Justification |
|---|---|---|
| **Full-Stack Web App** | **Next.js 15/16 App Router (TypeScript)** | Unified frontend + API routes, RSCs by default, server actions, mobile magic-link pages, Meta OAuth callbacks. |
| **Styling & Aesthetics** | **Tailwind CSS + shadcn/ui + OpenHero** | Dark-mode glassmorphism (`#0A0D14` bg, `#121722` cards, `#00F0FF` accents) + WebGL shader heroes from `openhero`. |
| **Heavy Task Worker** | **Python 3.11+ (FastAPI)** | Cairo/Pango for unbreakable Bengali font shaping, `MoneyPrinterTurbo` for 9:16 video shorts, `KnifeLemon/Filee` for 240+ media format normalization. |
| **Database** | **PostgreSQL 16 (Containerized via Dokploy)** | Relational tenant isolation (`workspaceId`), append-only usage ledger, persistent Docker volume. |
| **Background Queue** | **pg-boss (PostgreSQL-backed)** | Uses PostgreSQL `SKIP LOCKED` for atomic job claiming; eliminates external Redis costs. |
| **Storage & CDN** | **Cloudinary (Free tier) + Cloudflare R2** | Cloudinary for dynamic image optimization (`f_auto,q_auto`); Cloudflare R2 for zero-egress video storage. |
| **Payments** | **Razorpay Subscriptions + YouPI-PG** | India-first UPI Autopay / cards via Razorpay; sovereign 0% UPI QR via YouPI-PG. |
| **Deployment Host** | **Dokploy on Ubuntu 24.04 VPS** | 1-click Git auto-deploy, automated Let's Encrypt SSL via Traefik. |

---

## 3. Architecture & Data Flow

```mermaid
graph TD
    USER[Business Owner / Creator] -->|Mobile / Desktop| TRAEFIK[Dokploy Traefik Reverse Proxy]
    
    subgraph Single VPS Host
        TRAEFIK -->|Port 3000| WEB[apps/web: Next.js App Router<br/>• UI & Glassmorphism Dashboard<br/>• Auth & Tenant Scoping<br/>• Mobile Magic-Link Approval Page<br/>• Meta OAuth Handlers & Billing API]
        
        WEB -->|Internal TCP :5432| DB[(PostgreSQL 16<br/>• Tenant Records<br/>• Credits Ledger<br/>• pg-boss Queue Tables)]
        
        WEB -->|Internal HTTP :8000| WORKER[apps/python-worker: FastAPI<br/>• Cairo/Satori Bengali Poster Engine<br/>• MoneyPrinterTurbo Short-Video Factory<br/>• Turnitout Anti-Slop Scrubber<br/>• Filee 240+ Media Normalizer]
        
        WORKER -->|Claim Jobs & Write State| DB
        WORKER -->|Signed Uploads| CDN[Cloudinary / Cloudflare R2]
    end
    
    WEB -->|Official Graph API| META[Meta Graph API (FB & IG)]
    WEB -->|UPI Autopay / Cards| PAY[Razorpay Gateway]
    WEB -->|Transactional Magic Links| RESEND[Resend Email / WhatsApp Link]
```

---

## 4. Multi-Tenant Security & Tenancy Rules

1. **Every tenant table contains `workspaceId`:** All database queries are routed through the tenant-scoped repository in `packages/db`. Direct, un-scoped Prisma calls are prohibited.
2. **Server-Side Authorization:** Every request resolves `(user, organization, workspace, role)` on the server. Client-provided `workspaceId` is never trusted.
3. **Encrypted Social Tokens:** Tokens are encrypted using AES-256-GCM before storage, decrypted only inside worker execution paths, and never sent to the browser or logged.
4. **Magic-Link Mobile Security:** Mobile approval URLs use cryptographically random SHA-256 hashed tokens with a 72-hour expiration, scoped strictly to a single content item.
5. **Zero In-Process Video:** Video transcoding and font rasterization are strictly prohibited in the Next.js process to prevent memory leaks and thread blocking.

---

## 5. Phased Implementation Roadmap & Live Status

| Phase | System Module | Status | Verification & Deliverables |
|---|---|:---:|---|
| **Phase 0** | Workspace Scaffolding & Monorepo Foundation | ✅ **COMPLETED** | pnpm workspaces (`@abcd/web`, `@abcd/db`, `@abcd/ui`, `@abcd/integrations`), `tokens.css`, `docker-compose.yml`, `.env.example`. |
| **Phase 1** | Database Layer & Tenancy Model (`packages/db`) | ✅ **COMPLETED** | Neon Serverless PostgreSQL 16 (`ep-late-cake-ao3sl5vr`), Prisma Client, strict `createTenantRepository(workspaceId)`, append-only `UsageLedger`, tenant isolation tests. |
| **Phase 2** | Authentication, RBAC & Dashboard Shell (`apps/web`) | ✅ **COMPLETED** | NextAuth (Credentials + Google OAuth), `WorkspaceSwitcher`, mobile bottom navigation dock, 4 standard UI states, role-gating (SUPER_ADMIN, OWNER, STAFF, CREATOR). |
| **Phase 3** | Python Worker & Bengali Poster Studio (`apps/python-worker`) | ✅ **COMPLETED** | FastAPI on port 8000, 1080×1080 Pillow poster rendering with Bengali/English typography, Edge-TTS neural voiceovers (`bn-IN-TanishaaNeural`, `en-IN-NeerjaNeural`), direct Cloudinary CDN upload. |
| **Phase 4** | Content Studio & Multi-Channel Copywriter | ✅ **COMPLETED** | 3-tier AI failover (Groq, NVIDIA NIM, OpenRouter), Turnitout anti-slop scrubber, Web Speech API Bengali/English voice assistant ("Tap & Speak Your Offer"), live poster preview. |
| **Phase 5** | Mobile Magic-Link Approval Engine (`/approve/[token]`) | ✅ **COMPLETED** | SHA-256 single-use cryptographic tokens (72h expiry), zero-login mobile web view for 360px screens with 50px tap targets, 1-tap Approve & Schedule, test script passed. |
| **Phase 6** | `pg-boss` Publishing Queue & Meta Social Integration | ✅ **COMPLETED** | `packages/integrations` with AES-256-GCM token encryption, official 2-step Instagram media container flow (`containerId` stored before publish), atomic `SKIP LOCKED` worker queue, `/calendar` & `/social` UI views. |
| **Phase 7** | India Billing & Subscriptions (`/billing`) | ✅ **COMPLETED** | Razorpay checkout + HMAC-SHA256 signature verification, Starter (₹499) & Growth (₹999) plans, direct Sovereign UPI QR modal, live authenticated test keys (`rzp_test_TtPaVvCeFmoKOR`), append-only credit ledger. |
| **Phase 8** | Founder Marketing Cockpit (`/admin/marketing`) | ✅ **COMPLETED** | Super Admin route guard (`suman.baidya.pro@gmail.com`), zero-cost OpenStreetMap B2B lead generation (`harvey`), build-in-public storyteller (`brag`), live unit economics margin tracker (`Wally`). |
| **Phase 9** | Security Auditing, Tenant Isolation Tests & Error Hardening | ⏳ **UP NEXT** | Multi-tenant isolation test suite, token encryption leak tests, rate-limiting, CSRF hardening. |
| **Phase 10** | Dokploy Single-VPS Production Deployment | 📋 Planned | Docker container assembly, Traefik SSL certificate provisioning, Cloudflare R2 automated daily database snapshot backup cron. |

