import Link from "next/link";
import Image from "next/image";
import { getSiteSettingByKey } from "@abcd/db";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/site-settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { AnnouncementBar } from "@/components/public/AnnouncementBar";
import { MacBookShowcase } from "@/components/public/MacBookShowcase";
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
    const setting = await getSiteSettingByKey("public_site_cms");

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
          {/* SOCIAL MEDIA SHOWCASE (Icons only on mobile, text on desktop) */}
          {/* ========================================================= */}
          <div className="mt-10 sm:mt-12 max-w-6xl mx-auto rounded-2xl bg-card/75 border border-border/80 backdrop-blur-xl p-3 sm:p-4 shadow-sm hover:border-primary/30 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-center sm:text-left shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                  Official Network Integrations
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Zero scraping • Zero browser bots • Meta & Google Verified
                </span>
              </div>

              {/* 5 Social Media Badges (Icons only on mobile, full label on desktop) */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-nowrap py-0.5">
                <div
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/25 text-foreground hover:border-pink-500/50 hover:-translate-y-0.5 transition-all text-xs font-semibold shrink-0 cursor-default"
                  title="Instagram Business"
                >
                  <Instagram className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-pink-500 shrink-0" />
                  <span className="hidden sm:inline">Instagram Business</span>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-foreground hover:border-blue-500/50 hover:-translate-y-0.5 transition-all text-xs font-semibold shrink-0 cursor-default"
                  title="Facebook Pages"
                >
                  <Facebook className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-blue-500 shrink-0" />
                  <span className="hidden sm:inline">Facebook Pages</span>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-foreground hover:border-sky-500/50 hover:-translate-y-0.5 transition-all text-xs font-semibold shrink-0 cursor-default"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-sky-400 shrink-0" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-500/10 border border-zinc-500/25 text-foreground hover:border-zinc-500/50 hover:-translate-y-0.5 transition-all text-xs font-semibold shrink-0 cursor-default"
                  title="X (Twitter)"
                >
                  <Twitter className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-zinc-300 shrink-0" />
                  <span className="hidden sm:inline">X (Twitter)</span>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25 text-foreground hover:border-red-500/50 hover:-translate-y-0.5 transition-all text-xs font-semibold shrink-0 cursor-default"
                  title="YouTube Shorts"
                >
                  <Youtube className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-red-500 shrink-0" />
                  <span className="hidden sm:inline">YouTube Shorts</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* DEDICATED SHOWCASE SECTION (MacBook Desktop + Mobile Phone) */}
        {/* ========================================================= */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
              Full Autopilot Cockpit
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2">
              Everything you need to automate your social brand
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground mt-2.5">
              From raw voice idea to approved multi-channel campaign in seconds. Zero design skills required.
            </p>
          </div>

          <MacBookShowcase />
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
