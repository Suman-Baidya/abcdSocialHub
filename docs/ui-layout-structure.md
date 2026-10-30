# ABCD Social Hub — Dashboard Layout & UI Structure Specification

Canonical documentation for the multi-user dashboard layout architecture, responsive shell behavior, typographic limits, and card spacing rules.

---

## 1. System Architecture Overview

The ABCD Social Hub dashboard follows a unified, responsive App Shell architecture designed for Indian local business owners and solo founders across desktop, tablet, and mobile browsers:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Desktop View (xl: >= 1280px)                                                │
│                                                                              │
│  ┌───────────────────────┬────────────────────────────────────────────────┐  │
│  │ Fixed Sidebar (64px)  │ Sticky Top Header (h-16 / 64px, px-4 to px-6) │  │
│  │ Brand Header          │ [PanelLeft Toggle]  [Search Ctrl+K]  [Profile] │  │
│  ├───────────────────────┼────────────────────────────────────────────────┤  │
│  │ Nav Groups:           │ Main Content Canvas (px-4 to px-6, pt-3/4)     │  │
│  │ • Main Menu           │ • PageBreadcrumb (2-3 words title, 7-8 desc)   │  │
│  │ • Channels & Growth   │ • Metric Grid (compact p-3.5/p-4 rounded-xl)   │  │
│  │ • Administration      │ • Action Briefing & Workspace Widgets          │  │
│  ├───────────────────────┤                                                │  │
│  │ User Profile Card     │                                                │  │
│  │ (Avatar, Role, Logout)│                                                │  │
│  └───────────────────────┴────────────────────────────────────────────────┘  │
│                                                                              │
│  Mobile View (< 1280px)                                                      │
│  Top Header (h-16) + Main Content (pb-24) + MobileBottomNav (5 Native Tabs)  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Shell Components Specification

### A. Collapsible Desktop Sidebar (`<aside>`)
- **File:** `apps/web/app/(dashboard)/layout.tsx`
- **Widths:**
  - Expanded: `xl:w-[270px]`
  - Collapsed: `xl:w-[72px]`
  - Mobile Drawer: `w-[270px]` (hidden with `-translate-x-full xl:translate-x-0`)
- **Animation & Easing:**
  `transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`
- **Sticky / Fixed Position:** `fixed top-0 left-0 z-50 h-full border-r border-border bg-card`
- **Strict Vertical Axis Center (Collapsed):**
  When collapsed to `72px`, all elements are strictly centered along `x = 36px`:
  - Brand Emblem: `w-10 h-10 rounded-xl`
  - Nav Item Icons: `w-10 h-10 rounded-xl mx-auto flex items-center justify-center`
  - Profile Avatar: `w-10 h-10 rounded-xl`
- **Brand Header:** Fixed `h-16` (64px) matching header line. Contains `Sparkles` gradient brand badge.
- **Bottom Profile Card:** Replaces legacy marketing cards. Located at `p-3 border-t border-border`. Shows user initial avatar, full name, role badge, sign-out button, and links directly to `/team`.
- **Persistence:** User's collapsed preference is saved to `localStorage` under `abcd_sidebar_collapsed`.

### B. Sticky Top Navigation Bar (`<header>`)
- **File:** `apps/web/app/(dashboard)/layout.tsx`
- **Height:** Strictly `h-16` (64px).
- **Position:** `sticky top-0 z-30 bg-card/90 backdrop-blur-xl border-b border-border`
- **Padding:** Fluid `px-4 sm:px-5 lg:px-6` (aligns flush with sidebar and canvas, zero centering void).
- **Left Elements:**
  - Mobile Hamburger Menu (`Menu`, `xl:hidden`)
  - Desktop Quick Expand Button (`PanelLeft`, `w-8 h-8 rounded-lg border border-border/70`): Appears **only** when sidebar is collapsed.
  - Global Search Command Bar (`Ctrl K` shortcut with input ref).
- **Right Tray:**
  - `WorkspaceSwitcher` (Multi-brand tenant selector)
  - Theme Toggle (`Sun` / `Moon` with interactive rotation)
  - Notifications Bell (`Bell` with active indicator)
  - User Badge Pill with compact role tag (`text-[9px] px-1.5 py-0.5 uppercase`)
  - Sign Out Icon (`LogOut`)

### C. Mobile Native App Bottom Bar (`<MobileBottomNav>`)
- **File:** `apps/web/components/dashboard/MobileBottomNav.tsx`
- **Breakpoint:** Visible on mobile/tablet (`xl:hidden`), fixed at `bottom-0 left-0 right-0 z-40`.
- **Height & Safe Area:** `h-16 pb-safe bg-card/95 backdrop-blur-xl border-t border-border`.
- **5 Native App Tabs:**
  1. **Report:** `/dashboard` (Autopilot overview)
  2. **Queue:** `/calendar` (Publishing calendar)
  3. **Create:** `/content` (Highlighted elevated floating pill with primary gradient)
  4. **Leads:** `/leads` (WhatsApp inquiries)
  5. **More:** Sliding bottom sheet drawer for secondary links (Brand Kit, Billing, Team, Cockpit).

---

## 3. Page Content Canvas & Layout Rules

### Main Content Area Container
```tsx
<main className="flex-1 px-4 sm:px-5 lg:px-6 pt-3 sm:pt-4 space-y-4 sm:space-y-5 pb-24 xl:pb-12 w-full">
  {children}
</main>
```
- **Margin Shift:** `transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`
  - Collapsed: `xl:ms-[72px]`
  - Expanded: `xl:ms-[270px]`
- **Bottom Padding:** `pb-24` on mobile (prevents bottom nav overlap), `xl:pb-12` on desktop.

### Page Root Container
Every subpage (`apps/web/app/(dashboard)/*`) must wrap its root with:
```tsx
<div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
  ...
</div>
```

---

## 4. Strict Typography & Breadcrumb Rules

Every dashboard page must use `PageBreadcrumb` with `hideBreadcrumb={true}`:

```tsx
<PageBreadcrumb
  pageTitle="2-3 Words Title"
  description="7-8 words description providing clear, actionable page summary."
  hideBreadcrumb={true}
>
  {/* Single primary page action button */}
</PageBreadcrumb>
```

### Constraints Checklist:
1. **Breadcrumb / Pagination Pills:** Strictly hidden (`hideBreadcrumb={true}`). No `[Home] Dashboard > ...` pills cluttering the page header.
2. **Heading Title Limit:** Strictly **2 to 3 words maximum**.
3. **Description Limit:** Strictly **7 to 8 words maximum**.
4. **Primary Action:** At most one primary action button per header (`bg-primary text-primary-foreground text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-md active:scale-95`).

### Canonical Page Title Registry:
| Route | Page Title | Canonical Description | Word Count |
| :--- | :--- | :--- | :--- |
| `/dashboard` | **Autopilot Overview** | *Real-time marketing intelligence and automated campaign operations.* | 2 words / 8 words |
| `/content` | **AI Content Studio** | *Generate regional posters and AI promotional copy.* | 3 words / 7 words |
| `/calendar` | **Publishing Queue** | *Scheduled content calendar and automated publishing queue.* | 2 words / 7 words |
| `/social` | **Social Accounts** | *Connect official social channels with encrypted credentials.* | 2 words / 7 words |
| `/brand` | **Brand Identity Kit** | *Configure brand assets, colors, and typography styles.* | 3 words / 7 words |
| `/leads` | **WhatsApp Leads** | *Customer inquiries captured from your social campaigns.* | 2 words / 7 words |
| `/billing` | **Billing & Plans** | *Manage subscription plans, quotas, and credit balances.* | 3 words / 7 words |
| `/team` | **Team & Roles** | *Manage organization members and role-based access permissions.* | 3 words / 7 words |

---

## 5. Metric & Stat Card Spacing Standard

To prevent cards from appearing "spacy" (tall with empty voids):

### Rules for KPI & Metric Cards:
1. **Never use `flex flex-col justify-between` on metric cards:** It forces top icons and bottom numbers to opposite edges, creating an empty gap.
2. **Mobile & Desktop Grid Proportions:**
   - Always use `grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5`.
   - On mobile screens (< 1024px), cards render strictly **2 boxes per row = 2 rows, 2 columns = 4 boxes** in a clean 2×2 mobile app grid. Never allow 1 card per row stack.
3. **Card Dimensions & Spacing:**
   - Outer Container: `p-3 sm:p-3.5 md:p-4 rounded-xl border border-border bg-card shadow-sm`
   - Icon Box: `h-7 w-7 sm:h-8 sm:w-8 rounded-lg` with `w-3.5 h-3.5 sm:w-4 sm:h-4` icon.
   - Badge / Pill: `text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full`
   - Label: `text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate block`
   - Metric Number: `mt-0.5 text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight`
   - Grid Gap: `gap-2.5 sm:gap-3 md:gap-3.5`
3. **Canonical Card JSX Pattern:**
```tsx
<div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 transition-all hover:border-primary/40 shadow-sm">
  <div className="flex items-center justify-between">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
      <CheckCircle2 className="w-4 h-4" />
    </div>
    <div className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
      <ArrowUp className="w-2.5 h-2.5" />
      <span>+12.4%</span>
    </div>
  </div>
  <div className="mt-2.5">
    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
      Published Posts
    </span>
    <h4 className="mt-0.5 text-xl sm:text-2xl font-bold text-foreground tracking-tight">
      {stats.publishedCount}
    </h4>
  </div>
</div>
```

---

## 6. Theme Tokens (No Hardcoding)

In compliance with `AGENTS.md Rule 3`:
- **Backgrounds:** `bg-background` (page canvas), `bg-card` (cards, sidebar, panels), `bg-muted` (inputs, badges, secondary pills).
- **Borders:** `border-border` only. Never hardcode `border-zinc-800` or `border-white/*`.
- **Text:** `text-foreground` (headings, body), `text-muted-foreground` (labels, captions, subtitles).
- **Accents:** `bg-primary`, `text-primary`, `border-primary/30`, `text-primary-foreground`.
- **Status Tokens:**
  - Published / Active: Emerald (`bg-emerald-500/10 text-emerald-500 border-emerald-500/20`)
  - Scheduled / In Queue: Sky (`bg-sky-500/10 text-sky-500 border-sky-500/20`)
  - Review Required / Warning: Amber (`bg-amber-500/10 text-amber-500 border-amber-500/20`)
  - Error / Failed / Disconnected: Rose/Destructive (`bg-rose-500/10 text-rose-500 border-rose-500/20`)

