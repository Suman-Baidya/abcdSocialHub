import Link from "next/link";
import Image from "next/image";
import { prisma } from "@abcd/db";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/site-settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { AnnouncementBar } from "@/components/public/AnnouncementBar";
import {
  Sparkles,
  Smartphone,
  Palette,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Calendar,
  Layers,
  Clock,
  Send,
  Check,
  ChevronRight,
  Users,
  Building2,
  Bot,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "public_site_cms" },
    });

    if (!setting?.data) return DEFAULT_SITE_SETTINGS;

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...(setting.data as Partial<SiteSettings>),
      hero: {
        ...DEFAULT_SITE_SETTINGS.hero,
        ...((setting.data as any)?.hero || {}),
      },
      announcement: {
        ...DEFAULT_SITE_SETTINGS.announcement,
        ...((setting.data as any)?.announcement || {}),
      },
      general: {
        ...DEFAULT_SITE_SETTINGS.general,
        ...((setting.data as any)?.general || {}),
        socialLinks: {
          ...DEFAULT_SITE_SETTINGS.general.socialLinks,
          ...((setting.data as any)?.general?.socialLinks || {}),
        },
      },
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  const { hero, announcement, features, pricingTiers, general } = settings;

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Announcement Bar (scrolls with page) */}
      <AnnouncementBar announcement={announcement} />

      {/* Sticky Navbar (sticks to top on scroll) */}
      <PublicNavbar brandName={general?.brandName} />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* HERO SECTION (Buffer + MyClaw.ai Hybrid) */}
        {/* ========================================================= */}
        <section className="relative pt-10 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-[120px] pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary mb-6 shadow-xs animate-in fade-in zoom-in-95 duration-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{hero.badgeText}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] max-w-4xl mx-auto text-foreground">
            {hero.headline} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-sky-400 to-blue-500 bg-clip-text text-transparent">
              {hero.highlightedText}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {hero.subheadline}
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link
              href={hero.primaryCtaLink || "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm transition-all shadow-lg shadow-primary/25 active:scale-[0.98] cursor-pointer"
            >
              <span>{hero.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={hero.secondaryCtaLink || "/services"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-semibold text-sm transition-all shadow-xs cursor-pointer"
            >
              <span>{hero.secondaryCtaText}</span>
            </Link>
          </div>

          {/* Trust Footnote */}
          <div className="mt-5 flex items-center justify-center gap-5 sm:gap-6 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No credit card needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% Account Safety
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Setup in 2 minutes
            </span>
          </div>

          {/* ========================================================= */}
          {/* SOCIAL MEDIA SHOWCASE (Prominently Displayed in Hero)      */}
          {/* ========================================================= */}
          <div className="mt-10 sm:mt-12 max-w-4xl mx-auto rounded-2xl bg-card/70 border border-border/80 backdrop-blur-xl p-3.5 sm:p-5 shadow-sm hover:border-primary/30 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                  Official Network Integrations
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Zero scraping • Zero browser bots • Meta & Google Verified
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-foreground hover:border-pink-500/50 hover:-translate-y-0.5 transition-all">
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram Business</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-foreground hover:border-blue-500/50 hover:-translate-y-0.5 transition-all">
                  <Facebook className="w-3.5 h-3.5 text-blue-500" />
                  <span>Facebook Pages</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-foreground hover:border-sky-500/50 hover:-translate-y-0.5 transition-all">
                  <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                  <span>LinkedIn</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-foreground hover:border-red-500/50 hover:-translate-y-0.5 transition-all">
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>YouTube Shorts</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-500/10 border border-zinc-500/20 text-foreground hover:border-zinc-500/50 hover:-translate-y-0.5 transition-all">
                  <Twitter className="w-3.5 h-3.5 text-zinc-300" />
                  <span>X (Twitter)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* INTERACTIVE LIVE AUTOPILOT ENGINE MOCKUP (MyClaw + Buffer) */}
          {/* ========================================================= */}
          <div className="mt-8 relative mx-auto max-w-5xl rounded-3xl border border-border/80 bg-card/85 p-2 sm:p-4 shadow-2xl backdrop-blur-2xl overflow-hidden hover:border-primary/30 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

            {/* Mock Dashboard Window Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-foreground/80 hidden sm:inline">
                  abcd-social.app / autopilot / live-preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  AUTOPILOT ACTIVE
                </span>
              </div>
            </div>

            {/* Window Content: 3-Stage Pipeline (Mobile Optimized) */}
            <div className="p-3 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 text-left items-center">
              {/* Stage 1: Raw Idea Input */}
              <div className="lg:col-span-4 rounded-2xl bg-muted/40 border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary" /> 1. Raw Business Idea
                  </span>
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono">
                    Text / Voice
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/80 text-xs text-foreground font-sans leading-relaxed">
                  &ldquo;Weekend Mega Health & Wellness Drive: Free vitals & blood sugar checkup, 15% discount on family health packages. Walk-ins welcome this Saturday & Sunday!&rdquo;
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Category: <strong>Healthcare / Retail Commerce</strong></span>
                </div>
              </div>

              {/* Stage 2: AI Autopilot & Graphic Engine (Hidden on extra small mobile screens for streamlined experience) */}
              <div className="hidden sm:block lg:col-span-4 rounded-2xl bg-muted/40 border border-primary/30 p-4 space-y-3 relative shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Bot className="w-3 h-3" /> 2. Autopilot Processing
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">
                    0.4s Fast Render
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-primary" /> Brand Identity Kit
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400">APPLIED</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Anti-Slop Hook
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400">OPTIMIZED</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Pricing Guardrail
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400">VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Stage 3: Phone 1-Tap Mobile Review */}
              <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Smartphone className="w-3 h-3" /> 3. WhatsApp 1-Tap Review
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">Mobile Direct</span>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      A
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Post Batch #104 Ready</p>
                      <p className="text-[10px] text-muted-foreground">Tap to publish across FB & IG</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="py-1.5 px-3 rounded-lg bg-emerald-500 text-black text-center text-xs font-bold shadow-xs">
                      ✓ Approve
                    </div>
                    <div className="py-1.5 px-3 rounded-lg bg-muted text-center text-xs font-medium text-muted-foreground">
                      Edit Draft
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground text-center">
                  Zero password required on mobile phone
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3 CORE VALUE PILLARS (Slack-Inspired High Clarity) */}
        {/* ========================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
              Built for Commerce Across India
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2">
              Social media that runs itself while you run your business
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground mt-3">
              Built for retail shops, clinics, fitness centers, and creators who need consistent social media reach without spending hours on complex design software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    {feature.icon === "Palette" ? (
                      <Palette className="w-6 h-6" />
                    ) : feature.icon === "Smartphone" ? (
                      <Smartphone className="w-6 h-6" />
                    ) : (
                      <Zap className="w-6 h-6" />
                    )}
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted text-[11px] font-semibold text-primary mb-3">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{feature.badge}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2.5 tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-border/60">
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <span>Read capability specs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* INTERACTIVE 4-STEP AUTOPILOT WALKTHROUGH (Buffer/Slack) */}
        {/* ========================================================= */}
        <section className="py-16 sm:py-20 bg-card/40 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                How It Works
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1.5">
                From Raw Idea to Published Post in 4 Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-card border border-border space-y-2.5 hover:border-primary/30 transition-all hover:-translate-y-0.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center">
                  1
                </div>
                <h4 className="text-base font-bold text-foreground">Save Your Brand Kit</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Upload your business logo, primary colors, phone number, and address footer once.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-card border border-border space-y-2.5 hover:border-primary/30 transition-all hover:-translate-y-0.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center">
                  2
                </div>
                <h4 className="text-base font-bold text-foreground">AI Generates 30 Days</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The autopilot creates promotional graphics and captions tailored to Indian shopping seasons and events.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-card border border-border space-y-2.5 hover:border-primary/30 transition-all hover:-translate-y-0.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center">
                  3
                </div>
                <h4 className="text-base font-bold text-foreground">1-Tap WhatsApp Review</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You receive an instant link on WhatsApp. Tap &ldquo;Approve&rdquo; from your phone with zero passwords.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-card border border-border space-y-2.5 hover:border-primary/30 transition-all hover:-translate-y-0.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center">
                  4
                </div>
                <h4 className="text-base font-bold text-foreground">Official Auto-Publishing</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Posts schedule and publish automatically to Instagram, Facebook, and LinkedIn on optimal times.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* DECISION MATRIX (Agency vs Canva DIY vs ABCD Social) */}
        {/* ========================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
              Clear Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1.5">
              Why Indian Business Owners Choose ABCD Social
            </h2>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="p-4 font-bold text-foreground">Feature Comparison</th>
                    <th className="p-4 font-semibold text-muted-foreground">Traditional Agency</th>
                    <th className="p-4 font-semibold text-muted-foreground">Canva / DIY</th>
                    <th className="p-4 font-bold text-primary bg-primary/10">ABCD Social Hub</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-4 font-medium text-foreground">Monthly Cost</td>
                    <td className="p-4 text-muted-foreground">₹15,000 – ₹30,000</td>
                    <td className="p-4 text-muted-foreground">₹499 + Your Time</td>
                    <td className="p-4 font-bold text-foreground bg-primary/5">From ₹999/mo</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Time Required / Month</td>
                    <td className="p-4 text-muted-foreground">5–8 hrs in meetings</td>
                    <td className="p-4 text-muted-foreground">20+ hrs manual work</td>
                    <td className="p-4 font-bold text-foreground bg-primary/5">5 mins on phone</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Graphic Poster Engine</td>
                    <td className="p-4 text-muted-foreground">Manual designer only</td>
                    <td className="p-4 text-muted-foreground">Manual drag & drop</td>
                    <td className="p-4 font-bold text-emerald-500 bg-primary/5">✓ Automated 60FPS Vector</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Mobile Phone Approvals</td>
                    <td className="p-4 text-muted-foreground">Clunky email chains</td>
                    <td className="p-4 text-muted-foreground">Manual app exports</td>
                    <td className="p-4 font-bold text-emerald-500 bg-primary/5">✓ 1-Tap WhatsApp Link</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Publishing Ban Risk</td>
                    <td className="p-4 text-muted-foreground">Manual / Shared passwords</td>
                    <td className="p-4 text-muted-foreground">Manual copying</td>
                    <td className="p-4 font-bold text-emerald-500 bg-primary/5">✓ 0% Ban (Official APIs)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TRANSPARENT PRICING PREVIEW */}
        {/* ========================================================= */}
        <section className="py-16 sm:py-20 bg-muted/20 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
              Transparent India-First Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1.5 mb-3">
              Simple plans that pay for themselves in 1 client lead
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
              Billed in Indian Rupees (₹). Secure checkout powered by Razorpay UPI Autopay. GST tax invoices provided.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative transition-all duration-300 ${
                    tier.popular
                      ? "bg-card border-2 border-primary shadow-2xl shadow-primary/10 hover:-translate-y-1"
                      : "bg-card border border-border shadow-sm hover:border-border/80 hover:-translate-y-0.5"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      {tier.badge || "MOST POPULAR"}
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      {tier.name}
                    </div>
                    <div className="text-3xl font-black text-foreground mb-2">
                      ₹{tier.price.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-muted-foreground">/month</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                      {tier.description}
                    </p>

                    <div className="space-y-2.5 text-xs text-foreground mb-8">
                      {tier.features.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={tier.ctaLink || `/register?plan=${tier.id}`}
                    className={`w-full py-3 rounded-xl font-bold text-xs text-center transition-all cursor-pointer ${
                      tier.popular
                        ? "bg-primary hover:opacity-90 text-primary-foreground shadow-md shadow-primary/20 active:scale-95"
                        : "bg-muted hover:bg-muted/80 text-foreground border border-border active:scale-95"
                    }`}
                  >
                    {tier.ctaText}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <span>View complete feature breakdown and billing FAQ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* BOTTOM HIGH-CONVERTING CTA BANNER */}
        {/* ========================================================= */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="rounded-3xl bg-gradient-to-tr from-primary/15 via-card to-card border border-primary/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Ready to put your social media marketing on autopilot?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Join hundreds of local businesses, clinics, and creators across India who save 15+ hours every month.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm shadow-xl shadow-primary/25 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start 14-Day Free Pilot</span>
                </Link>
                <Link
                  href="/services"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-semibold text-xs transition-colors"
                >
                  Explore Capabilities
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Shared Public Footer */}
      <PublicFooter general={general} />
    </div>
  );
}
