import Link from "next/link";
import { prisma } from "@abcd/db";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/site-settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { AnnouncementBar } from "@/components/public/AnnouncementBar";
import {
  Sparkles,
  Palette,
  Smartphone,
  Zap,
  Share2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Check,
  Clock,
  Flame,
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

export default async function ServicesPage() {
  const settings = await getSiteSettings();
  const { announcement, services, general } = settings;

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <AnnouncementBar announcement={announcement} />
      <PublicNavbar brandName={general?.brandName} />

      <main className="flex-1">
        {/* Services Hero */}
        <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary mb-4 shadow-xs">
            <Cpu className="w-3.5 h-3.5" />
            <span>Core SaaS Capabilities & Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto">
            Engineered specifically for{" "}
            <span className="bg-gradient-to-r from-primary via-sky-400 to-blue-500 bg-clip-text text-transparent">
              Regional Commerce
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Generic Western social media tools fail Indian local businesses. ABCD Social was architected from day one to handle native Bengali font ligatures, WhatsApp approvals, and strict pricing integrity.
          </p>
        </section>

        {/* Detailed Services Breakdown */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-16">
          {services.map((service, idx) => {
            const isReversed = idx % 2 === 1;
            return (
              <div
                key={service.id}
                id={service.id}
                className={`rounded-3xl border border-border bg-card p-6 sm:p-10 flex flex-col ${
                  isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                } gap-8 lg:gap-12 items-center shadow-sm hover:border-primary/30 transition-all`}
              >
                {/* Text Content */}
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-muted text-[11px] font-semibold text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>{service.subtitle}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {service.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    {service.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Feature Card Mockup */}
                <div className="w-full lg:w-96 rounded-2xl bg-muted/40 border border-border/80 p-5 space-y-3 shrink-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-3">
                    <span className="font-mono text-[11px] text-foreground font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-primary" /> Architecture
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono">
                      FastAPI + Cairo
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Typography Renderer</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Noto Sans Bengali</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Handles complexযুক্তাক্ষর (conjuncts) server-side without reliance on browser Canvas glitches.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Phone Watermarking</span>
                      <span className="text-[10px] text-primary font-mono">Auto Burn-in</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Burns your verified logo, WhatsApp number, and address footer automatically.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Bottom CTA */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="rounded-3xl bg-card border border-primary/30 p-8 sm:p-12 shadow-xl space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Ready to automate your marketing?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Start your free pilot today and discover why regional brands trust ABCD Social Hub.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs sm:text-sm shadow-md shadow-primary/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Free Pilot</span>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-5 py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs sm:text-sm font-semibold border border-border"
              >
                View Pricing (₹)
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter general={general} />
    </div>
  );
}
