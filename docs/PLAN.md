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

## 5. Phased Implementation Roadmap

### Phase 1: Workspace Scaffolding & Monorepo Foundation
- Initialize root `package.json`, pnpm workspaces, and `.gitignore`.
- Set up production `docker-compose.yml` for Dokploy (Web, Python Worker, Postgres).
- Create `.env.example` with strict Zod validation schema.

### Phase 2: Database Layer & Tenancy Model (`packages/db`)
- Implement `schema.prisma` with models: `Organization`, `Workspace`, `User`, `Membership`, `BrandKit`, `ContentItem`, `ContentVariant`, `PublishJob`, `UsageLedger`, `AuditLog`.
- Create tenant-scoped repository wrapper enforcing `workspaceId` injection.
- Configure `pg-boss` queue tables inside PostgreSQL.

### Phase 3: Core UI & Glassmorphism Design System (`apps/web`)
- Setup Next.js 15 App Router with Tailwind CSS and Radix UI primitives.
- Implement design tokens in `tokens.css` (Dark theme: `#0A0D14` background, cyan accent `#00F0FF`).
- Build reusable building blocks: `AppShell`, `PageHeader`, `DataTable`, `StatCard`, `EmptyState`, `ErrorState`, `LoadingSkeleton`.
- Build the marketing landing page integrating `openhero` WebGL shader heroes.

### Phase 4: Python Heavy Media Worker (`apps/python-worker`)
- Setup FastAPI service with Dockerfile bundling GNU Cairo, Pango, and FFmpeg.
- Install native Indic fonts: `Noto Sans Bengali`, `Hind Siliguri`, `Tiro Bangla`.
- Implement `tasks/poster_render.py` for 1080×1080 branded poster synthesis.
- Implement `tasks/humanizer.py` with `Turnitout` anti-slop lexicon scrubbing.
- Implement `tasks/normalizer.py` with `KnifeLemon/Filee` for format normalization.

### Phase 5: Content Studio & 4-Platform Copywriter
- Multi-model content composer supporting brand tone, language (English/Bengali), and promotional briefs.
- Incorporate `Jakeschincariol` copywriting skills for Instagram, Facebook, LinkedIn, and X.
- Enforce append-only credits ledger (reserve, commit, refund).

### Phase 6: Mobile Magic-Link Approval Engine
- Dedicated mobile-first route `/approve/[token]` optimized for 360px smartphone screens.
- Displays live poster preview, channel variants, and scheduled publish time.
- Single-tap "Approve" and "Request Changes" actions with zero login friction.

### Phase 7: pg-boss Publishing Queue & Meta Graph API
- Implement `packages/integrations/meta` for official Facebook Page and Instagram Professional publishing.
- Support Instagram two-step container flow: store container ID before publish call.
- Bounded exponential backoff with jitter and clear user-facing error reasons.

### Phase 8: India Billing & Subscriptions
- Razorpay Subscriptions integration with UPI Autopay and card billing.
- Webhook signature verification and idempotency keys.
- YouPI-PG sovereign 0% UPI QR alternative for direct payments.

### Phase 9: Super Admin Founder Marketing Cockpit (`/admin/marketing`)
- 1-Click Code-to-Launch video teaser generator (`latent-spaces/brag`).
- Build-in-public Git commit changelog & thread writer.
- In-browser 3D interactive screencasts (`CristianOlivera1/openvid`).
- Sovereign local B2B prospecting tool (`ethanplusai/harvey`).
- Unit economics margin ledger (`polius/Wally`).

### Phase 10: Dokploy Single-VPS Production Deployment
- Connect Git repository to Dokploy Compose service.
- Verify container healthchecks and Traefik SSL routing.
- Set up daily automated database backup cron to Cloudflare R2.
