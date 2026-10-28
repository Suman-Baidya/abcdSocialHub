# ABCD Social Hub — Multi-Tenant Marketing Automation SaaS

AI-powered social media operations & marketing automation platform tailored for Indian small businesses (salons, clinics, fitness centers, tutors) and creator-led brands.

---

## 🏗️ Architecture & Monorepo Structure

Deployed on a single VPS with **Dokploy** as a two-service unified monorepo:

```text
abcd-social-hub/
├── docker-compose.yml              # Production Dokploy deployment definition
├── .env.example                    # Environment secrets schema
├── apps/
│   ├── web/                        # Next.js 15/16 App Router (UI, Auth, Billing, APIs)
│   └── python-worker/              # FastAPI Media Engine (Bengali Posters, Turnitout Anti-Slop)
├── packages/
│   ├── db/                         # Prisma Schema, Tenant-Scoped Repository, Migrations
│   └── ui/                         # Design system tokens, glassmorphism components
├── scripts/                        # Automated DB initialization & nightly R2 backups
└── docs/
    └── PLAN.md                     # Canonical Master System Design
```

---

## 🚀 Running Locally (Development)

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Python >= 3.11 (optional, only needed for local poster rendering)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
# Starts Next.js web application on http://localhost:3000
pnpm dev
```

To run both Next.js and the Python worker simultaneously:
```bash
pnpm dev:all
```

---

## 🚢 Deploying to Production (Dokploy)

1. Connect this repository to your **Dokploy** instance.
2. Select **Compose** service type and point to the `main` branch.
3. Paste the production environment variables into Dokploy's **Environment** tab.
4. Turn on **Auto Deploy on Git Push**. Every `git push` automatically rebuilds and deploys with zero downtime!
