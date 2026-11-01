import Link from "next/link";
import { getSiteSettingByKey } from "@abcd/db";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/site-settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { AnnouncementBar } from "@/components/public/AnnouncementBar";
import {
  Sparkles,
  Check,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  Building2,
  ArrowRight,
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

export default async function PricingPage() {
  const settings = await getSiteSettings();
  const { announcement, pricingTiers, general } = settings;

  const faqs = [
    {
      q: "What payment methods are supported?",
      a: "We support all major Indian payment methods via Razorpay: UPI Autopay (Google Pay, PhonePe, Paytm), Debit Cards, Credit Cards, and Netbanking.",
    },
    {
      q: "Do you provide official GST invoices?",
      a: "Yes. Every billing cycle generates an official GST invoice containing your business GSTIN for claiming 100% input tax credit (ITC).",
    },
    {
      q: "Is there any extra fee for high-resolution promotional poster rendering?",
      a: "No. The server-side Python Cairo graphic rendering engine is fully included in all plans with zero hidden fees.",
    },
    {
      q: "How does 1-tap WhatsApp mobile approval work?",
      a: "When your monthly campaign drafts are ready, our system sends a secure magic-link to your verified WhatsApp or Email. You review the poster and caption on your phone and tap 'Approve' in 5 seconds—zero passwords needed.",
    },
    {
      q: "Can I upgrade or downgrade my plan at any time?",
      a: "Yes. You can switch plans anytime from the Platform Billing dashboard. Upgrades take effect immediately with pro-rated billing.",
    },
    {
      q: "What happens if I run out of monthly posters?",
      a: "You can purchase additional poster credit packs directly from your dashboard or upgrade to the next tier with one click.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <AnnouncementBar announcement={announcement} />
      <PublicNavbar brandName={general?.brandName} />

      <main className="flex-1">
        {/* Pricing Header */}
        <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary mb-4 shadow-xs">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Transparent India-First Plans</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto">
            Predictable pricing that pays for itself with{" "}
            <span className="bg-gradient-to-r from-primary via-sky-400 to-blue-500 bg-clip-text text-transparent">
              One Customer Lead
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            No long-term locks. Cancel anytime. All plans include official Meta & Google API publishing with 100% ban protection.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-3xl p-7 sm:p-9 flex flex-col justify-between relative transition-all duration-300 ${
                  tier.popular
                    ? "bg-card border-2 border-primary shadow-2xl shadow-primary/15 -translate-y-1"
                    : "bg-card border border-border shadow-sm hover:border-border/80"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                    {tier.badge || "MOST POPULAR"}
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    {tier.name}
                  </div>
                  <div className="text-4xl font-black text-foreground mb-2 tracking-tight">
                    ₹{tier.price.toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-muted-foreground ml-1">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="space-y-3 text-xs text-foreground mb-8">
                    {tier.features.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={tier.ctaLink || `/register?plan=${tier.id}`}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs text-center transition-all cursor-pointer ${
                    tier.popular
                      ? "bg-primary hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            ))}
          </div>

          {/* Trust Guarantees */}
          <div className="mt-12 p-6 rounded-2xl bg-card border border-border/80 flex flex-wrap items-center justify-around gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Razorpay 256-Bit SSL Encryption</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>100% Official Meta Graph & Google APIs</span>
            </span>
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>GST Compliance & ITC Invoices</span>
            </span>
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="py-16 sm:py-20 bg-muted/20 border-y border-border px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Plan Comparison Matrix
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Everything you need to scale your regional marketing operations.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="p-4 font-bold text-foreground">Capability</th>
                      <th className="p-4 font-semibold text-muted-foreground text-center">Starter</th>
                      <th className="p-4 font-bold text-primary bg-primary/10 text-center">Growth Business</th>
                      <th className="p-4 font-semibold text-muted-foreground text-center">Agency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="p-4 font-medium text-foreground">Brand Workspaces</td>
                      <td className="p-4 text-center text-muted-foreground">1</td>
                      <td className="p-4 text-center font-bold text-foreground bg-primary/5">2</td>
                      <td className="p-4 text-center text-muted-foreground">5</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-foreground">Branded Posters / mo</td>
                      <td className="p-4 text-center text-muted-foreground">20</td>
                      <td className="p-4 text-center font-bold text-foreground bg-primary/5">50</td>
                      <td className="p-4 text-center text-muted-foreground">150</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-foreground">Cairo Graphic Poster Studio</td>
                      <td className="p-4 text-center text-emerald-500 font-bold">✓ Included</td>
                      <td className="p-4 text-center text-emerald-500 font-bold bg-primary/5">✓ Included</td>
                      <td className="p-4 text-center text-emerald-500 font-bold">✓ Priority</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-foreground">WhatsApp Mobile Magic-Link</td>
                      <td className="p-4 text-center text-emerald-500 font-bold">✓ Included</td>
                      <td className="p-4 text-center text-emerald-500 font-bold bg-primary/5">✓ Included</td>
                      <td className="p-4 text-center text-emerald-500 font-bold">✓ Multi-Client</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-foreground">Social Networks</td>
                      <td className="p-4 text-center text-muted-foreground">FB, IG</td>
                      <td className="p-4 text-center font-bold text-foreground bg-primary/5">FB, IG, LI, X</td>
                      <td className="p-4 text-center text-muted-foreground">All Channels</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-foreground">Team Roles & RBAC</td>
                      <td className="p-4 text-center text-muted-foreground">—</td>
                      <td className="p-4 text-center text-muted-foreground bg-primary/5">Standard</td>
                      <td className="p-4 text-center text-emerald-500 font-bold">✓ 4-Tier Hardened</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
              Have questions? We have answers.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter general={general} />
    </div>
  );
}

