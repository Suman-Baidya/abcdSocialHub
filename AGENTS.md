# AGENTS.md — ABCD Social

Marketing-automation SaaS for creators and business owners. Read `docs/PLAN.md` (the full plan and system design) before any non-trivial task. If this file and `docs/PLAN.md` disagree, stop and ask.

Keep this file short. Put long reference material in `docs/` and link it.

---

## 1. How to work

1. For any task bigger than a one-file fix, **write a short plan first** (files to touch, data changes, risks) and wait for approval.
2. Do **one small task at a time**. No unrelated refactors, renames, or dependency upgrades in the same change.
3. **Search the repo before creating anything.** Reuse existing components, hooks, utilities, and types.
4. **Never invent facts about third-party APIs** (Meta, YouTube, LinkedIn, X, WhatsApp, Razorpay). If unsure, say so, check the official docs, and mark it `VERIFY` in a code comment and in `docs/capability-matrix.md`.
5. If a requirement is ambiguous, ask one specific question instead of guessing.
6. **Definition of done** (all required):
   - `pnpm typecheck`, `pnpm lint`, and `pnpm test` pass.
   - New data access has a tenant-isolation test.
   - New UI has loading, empty, error, and permission-denied states.
   - No new console errors or warnings.
   - Short summary of what changed, what was not done, and any follow-up risks.

---

## 2. Fixed stack (do not change without approval)

- TypeScript everywhere for core SaaS logic (strict mode). Next.js App Router, React Server Components by default.
- Python 3.11+ strictly isolated in `apps/python-worker` (FastAPI) for Cairo Bengali font rendering, MoneyPrinterTurbo video assembly, and Filee format normalization.
- Tailwind CSS + shadcn/ui (Radix). Icons: `lucide-react` only.
- PostgreSQL 16 + Prisma. Queue: pg-boss in `apps/web` / worker.
- Validation: `zod` at every boundary (API input, env, LLM output, webhooks).
- Layout: `apps/web`, `apps/python-worker`, `packages/{db,core,integrations,ai,config,ui}`.

---

## 3. Design system (consistency rules)

**Source of truth:** design tokens in `packages/ui/styles/tokens.css` and components in `packages/ui`. Do not style outside the system.

- **No hardcoded values.** Never write raw hex colours, arbitrary pixel sizes (`w-[13px]`), custom shadows, or custom radii. Use semantic tokens only: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `border-border`, `ring-ring`, and the status tokens below.
- **Reuse before create.** Search `packages/ui` first. A new component is allowed only if nothing fits, must live in `packages/ui`, use `cva` variants, and be documented with a usage example.
- **Standard building blocks (always use these):** `AppShell`, `PageHeader`, `DataTable`, `StatCard`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `ConfirmDialog`, `StatusBadge`, `PlatformIcon`, `FormField`.
- **Spacing:** 4/8 px scale only (Tailwind default steps). Page content max width set by `PageContainer`.
- **Buttons:** one primary action per view. Destructive actions use `ConfirmDialog` and the destructive variant.
- **Status colours are fixed:** Published = success, Scheduled = info, In review window = warning, Held for approval = warning, Failed = destructive, Needs reconnect = destructive, Paused = muted.
- **Typography:** Inter for English; Noto Sans Bengali for Bengali text. Never fix text heights in a way that clips Bengali glyphs. Use the type scale classes only.
- **Themes:** light and dark via tokens. Every new view must be checked in both.
- **Responsive:** mobile-first. The public approval page (`/approve/[token]`) must work at 360 px width with large tap targets.
- **Accessibility:** visible focus states, labels on all inputs, AA contrast, keyboard navigation, no meaning by colour alone, `aria-live` for async status.
- **Copy:** plain language, sentence case, no jargon. Dates in IST (`Asia/Kolkata`), currency formatted with `en-IN` (₹).
- **Every data view has four states:** loading (skeleton), empty (with next action), error (with retry), no-permission.
- **Report-first:** the home screen is the Autopilot Report (what the AI did, what happened, what is planned next, what needs the user). Do not add dashboards that bypass this.

---

## 4. Performance rules (multi-user scale)

- **Server Components by default.** Add `"use client"` only for real interactivity, and keep client components small.
- **Paginate every list** (cursor pagination). Never load unbounded rows. Default page size 20–50.
- **No N+1 queries.** Use `include`/`select` deliberately and select only needed columns.
- **Index every new query path.** Tenant tables need indexes starting with `workspaceId`. Check with `EXPLAIN` for new heavy queries.
- **Never do slow work in a request.** AI calls, poster rendering, video, publishing, report generation, and email run as pg-boss jobs. The request enqueues and returns a job status.
- **Connections:** web uses the pooled connection string; the worker uses the direct (non-pooled) one. No connection created per request.
- **Caching:** cache only public or tenant-keyed data, with explicit revalidation. Never cache across tenants. No cache key without `workspaceId`.
- **Rate limits:** apply per user and per workspace on login, generation, uploads, and webhooks.
- **Media:** images via the Next.js image component or CDN with fixed sizes; videos and uploads in object storage with signed URLs, never through the web server's memory.
- **Bundle budget:** do not add a dependency over ~30 KB gzipped on the client without approval. Prefer dynamic import for charts, editors, and heavy widgets.
- **Idempotency:** every job and webhook handler must be safe to run twice.
- **Before launch:** include a load test (k6) for the main flows: login, dashboard load, create content, approve, enqueue publish.

---

## 5. Security rules (non-negotiable)

**Tenancy and authorization**
- Every tenant table has `workspaceId`. All DB access goes through the tenant-scoped repository in `packages/db`. **Never call Prisma directly from routes, actions, or components.**
- Resolve `(user, org, workspace, role)` on the server for every request. Never trust an `orgId` or `workspaceId` sent by the client.
- Every API route and Server Action starts with an authorization check. Add a test that user A cannot read or modify user B's data.
- Super-admin routes have a separate guard and MFA, and can never read tokens or secrets.

**Secrets and tokens**
- Never commit secrets. All env vars validated with `zod` at boot; fail fast.
- Social tokens are encrypted before storage (authenticated encryption, key outside the DB), decrypted only inside the worker or server code that calls the platform, and **never sent to the browser or logged**.
- Never log request bodies containing tokens, credentials, customer messages, or personal data. Use structured logs with redaction.

**Input and output**
- Validate every input with `zod`. Treat LLM output, uploaded files, imported website text, and webhook payloads as **untrusted**.
- Verify webhook signatures (Razorpay, Meta) before parsing; store events with a unique key for idempotency.
- Uploads: allowlist types, enforce size limits, private storage, signed URLs. No server-side fetching of arbitrary URLs; the website importer uses the hardened fetcher (scheme allowlist, DNS/IP checks, size and time limits).
- Never build SQL by string concatenation. Never render untrusted HTML without sanitising.

**Web hardening**
- Set security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, frame protections). Cookies: `HttpOnly`, `Secure`, `SameSite`.
- CSRF protection on mutating routes. Rate limit sensitive endpoints.
- Magic-link tokens: random, stored only as hashes, expiring, single-purpose, scoped to one content item.

**Dependencies**
- Pin versions, commit the lockfile, no unvetted packages. Ask before adding any dependency; state why it is needed and its maintenance status.

**Auditing**
- Write an `AuditLog` entry for connect or disconnect account, approve, publish, plan change, export, delete, and support session.

---

## 6. AI and autonomy rules

- The model **drafts**; deterministic code decides routing, risk class, billing, and permissions.
- The guardrail engine (`packages/core`) is mandatory for every generated post at every autonomy level. Risk classes can be raised by the model but **never lowered**.
- High-risk content (prices, offers, health/legal/financial/political/religious claims, complaints, missing facts) is **always held for a human**.
- Never invent prices, discounts, addresses, hours, guarantees, or testimonials. If a fact is missing, ask.
- Structured LLM output is validated with `zod`; invalid output is retried once, then fails without charging credits.
- All metered actions use the credits ledger: reserve, commit, refund. The ledger is append-only.
- Prompts live in `packages/ai`, versioned, with an evaluation set (English and Bengali). Changing a prompt requires running the evals.

---

## 7. Publishing and integrations rules

- Official APIs only. No scraping, no unofficial WhatsApp libraries, no browser automation of social platforms.
- Each platform lives in `packages/integrations/<platform>/` and implements the shared interface. Unsupported methods return `NOT_SUPPORTED`.
- Publishing is per destination. Jobs carry an idempotency key. For Instagram, **store the container ID before calling publish**, and create containers close to publish time.
- Retries: bounded, exponential backoff with jitter, respect `Retry-After`; auth errors stop and mark `NEEDS_RECONNECT`; permanent errors fail with a plain-language message.
- Time: store UTC, display IST.
- Respect the global and per-workspace pause switches in every job.

---

## 8. Do not

- Do not add n8n, Python services, Redis, or a second database without an approved decision recorded in `docs/PLAN.md`.
- Do not bypass the tenant-scoped repository, the guardrail engine, or the credits ledger "for speed".
- Do not hardcode colours, plan prices, limits, or API keys.
- Do not disable lint, type, or test rules to make something pass.
- Do not claim a feature works on a platform until it is verified with a test account.
- Do not leave `TODO` security shortcuts. If a check cannot be done now, stop and report it.
