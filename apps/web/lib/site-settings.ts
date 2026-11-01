import { z } from "zod";

export const siteSettingsSchema = z.object({
  hero: z.object({
    headline: z.string().min(5),
    highlightedText: z.string().min(2),
    subheadline: z.string().min(10),
    badgeText: z.string().min(3),
    primaryCtaText: z.string().min(2),
    primaryCtaLink: z.string().min(1),
    secondaryCtaText: z.string().min(2),
    secondaryCtaLink: z.string().min(1),
  }),
  announcement: z.object({
    enabled: z.boolean(),
    badge: z.string(),
    text: z.string(),
    linkText: z.string(),
    linkUrl: z.string(),
  }),
  features: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      badge: z.string(),
      icon: z.string(),
    })
  ),
  services: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      subtitle: z.string(),
      description: z.string(),
      points: z.array(z.string()),
      icon: z.string(),
    })
  ),
  pricingTiers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      currency: z.string().default("INR"),
      period: z.string().default("mo"),
      description: z.string(),
      popular: z.boolean().default(false),
      badge: z.string().optional(),
      features: z.array(z.string()),
      ctaText: z.string(),
      ctaLink: z.string(),
    })
  ),
  general: z.object({
    brandName: z.string(),
    tagline: z.string(),
    contactEmail: z.string().email(),
    contactPhone: z.string(),
    supportWhatsapp: z.string(),
    copyrightText: z.string(),
    socialLinks: z.object({
      instagram: z.string().url().or(z.literal("")),
      facebook: z.string().url().or(z.literal("")),
      linkedin: z.string().url().or(z.literal("")),
      twitter: z.string().url().or(z.literal("")),
      youtube: z.string().url().or(z.literal("")),
    }),
  }),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero: {
    headline: "Turn Raw Ideas into 30 Days of",
    highlightedText: "Bengali & English Social Posts",
    subheadline:
      "Stop struggling with Canva and generic AI slop. Generate pixel-perfect branded promotional posters, approve them in 1 tap from your phone, and publish automatically across all platforms.",
    badgeText: "AI Marketing Autopilot for Creators & Businesses",
    primaryCtaText: "Start Free Pilot",
    primaryCtaLink: "/register",
    secondaryCtaText: "Explore Solutions",
    secondaryCtaLink: "/services",
  },
  announcement: {
    enabled: true,
    badge: "NEW",
    text: "Cairo Bengali Typography Engine v2.4 with 60 FPS Export Released",
    linkText: "Learn more",
    linkUrl: "/services",
  },
  features: [
    {
      id: "poster-studio",
      title: "Branded Regional Poster Studio",
      description:
        "Native Bengali (যুক্তাক্ষর) and English typography rendered server-side. Burn your logo, phone number, and address footer onto every promotional creative in 0.4s.",
      badge: "Zero Broken Ligatures",
      icon: "Palette",
    },
    {
      id: "mobile-approvals",
      title: "1-Tap Mobile Magic-Link Approvals",
      description:
        "Never log into a dashboard from a laptop. Review drafts directly on your phone via secure WhatsApp or Email links and tap Approve in 5 seconds.",
      badge: "Zero-Password Mobile Review",
      icon: "Smartphone",
    },
    {
      id: "anti-slop",
      title: "Turnitout Anti-Slop Humanizer",
      description:
        "Purges robotic AI words like 'delve' and 'testament'. Adapts copy natively to each network using tested hook and retention formulas.",
      badge: "4-Platform Custom Formats",
      icon: "Zap",
    },
  ],
  services: [
    {
      id: "cairo-poster-engine",
      title: "Server-Side Typography & Poster Engine",
      subtitle: "Zero distorted glyphs or broken ligatures",
      description:
        "Built on Python Cairo and Noto Sans Bengali. Every generated promotional poster accurately renders complex Bengali conjuncts with pixel precision, crisp brand colors, and dynamic footer banners.",
      points: [
        "Instant rasterization under 400ms",
        "Auto-embedded business phone, address, and logo watermark",
        "Supports 1:1 Square, 4:5 Portrait, and 9:16 Story formats",
        "Pre-approved Bengali festive and promotional templates",
      ],
      icon: "Palette",
    },
    {
      id: "ai-copywriter",
      title: "Turnitout Anti-Slop Regional AI",
      subtitle: "Authentic Bengali, English, and Banglish hooks",
      description:
        "Trained on high-converting Indian retail, clinic, salon, and hospitality copy. Formats distinct captions for Instagram, Facebook, LinkedIn, and Twitter with proper hashtag hygiene.",
      points: [
        "Bilingual tone adapting to your brand voice kit",
        "Eliminates AI jargon and robotic sentence patterns",
        "Automatic call-to-action with WhatsApp click-to-chat links",
        "Strict pricing guardrails—never hallucinates discounts",
      ],
      icon: "Sparkles",
    },
    {
      id: "autopilot-scheduler",
      title: "Official API Multi-Channel Publishing",
      subtitle: "Zero browser bots or risk of account bans",
      description:
        "Direct integration with Meta Graph API (Instagram Business & Facebook Pages), LinkedIn, and X. Handles Instagram 2-step media container verification automatically.",
      points: [
        "Pre-scheduled calendar queue with auto-retry and jitter",
        "Real-time token expiry checks with instant alert notifications",
        "Zero-exposure credential encryption (AES-256-GCM)",
        "Audit trail for every published or scheduled post",
      ],
      icon: "Share2",
    },
    {
      id: "magic-link-onboarding",
      title: "Mobile-First WhatsApp & Magic-Link Review",
      subtitle: "Approve 30 days of posts from your phone in 5 minutes",
      description:
        "Busy business owners don't want complex dashboards. Whenever the AI generates a post batch, you receive a single secure link on WhatsApp or Email.",
      points: [
        "One-tap Approve, Request Edit, or Reject buttons",
        "Zero logins or passwords required on mobile",
        "Full image preview and multi-platform caption tabs",
        "Instant webhook confirmation once approved",
      ],
      icon: "Smartphone",
    },
  ],
  pricingTiers: [
    {
      id: "starter",
      name: "Starter",
      price: 999,
      currency: "INR",
      period: "mo",
      description: "Ideal for single local shops, clinics, and independent creators.",
      popular: false,
      features: [
        "1 Brand Workspace",
        "20 Branded Posters / month",
        "Facebook & Instagram Direct Publishing",
        "WhatsApp Mobile Magic-Link Approvals",
        "Standard Bengali & English AI Copywriting",
        "Razorpay UPI Autopay Support",
      ],
      ctaText: "Choose Starter",
      ctaLink: "/register?plan=starter",
    },
    {
      id: "growth",
      name: "Growth Business",
      price: 1499,
      currency: "INR",
      period: "mo",
      description: "For active clinics, salons, gyms, and growing local brands.",
      popular: true,
      badge: "Most Popular",
      features: [
        "2 Brand Workspaces",
        "50 Branded Posters / month",
        "4-Platform Copy Multiplexer (FB, IG, LI, X)",
        "WhatsApp Lead Click-to-Chat Integration",
        "Priority Cairo Typography Render Queue",
        "Live Autopilot Campaign Insights",
        "Instant Email & WhatsApp Notifications",
      ],
      ctaText: "Start 14-Day Pilot",
      ctaLink: "/register?plan=growth",
    },
    {
      id: "agency",
      name: "Agency & Multi-Brand",
      price: 2499,
      currency: "INR",
      period: "mo",
      description: "For local marketing consultants and franchise owners.",
      popular: false,
      features: [
        "5 Client Workspaces",
        "150 Branded Posters / month",
        "Multi-Brand Asset & Logo Ingestion",
        "Client Mobile Magic-Link Approvals",
        "4-Tier RBAC Team Permissions",
        "Dedicated Worker Processing SLA",
        "Custom Watermarking & Brand Guidelines",
      ],
      ctaText: "Choose Agency",
      ctaLink: "/register?plan=agency",
    },
  ],
  general: {
    brandName: "ABCD Social",
    tagline: "Autonomous Multi-Tenant Marketing & Publishing",
    contactEmail: "support@abcd.social",
    contactPhone: "+91 98300 12345",
    supportWhatsapp: "+91 98300 12345",
    copyrightText: "© 2026 ABCD Social Hub. All rights reserved.",
    socialLinks: {
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      twitter: "https://x.com",
      youtube: "https://youtube.com",
    },
  },
};
