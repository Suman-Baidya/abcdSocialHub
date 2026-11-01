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
    highlightedText: "Branded Social Media Posts",
    subheadline:
      "Stop struggling with Canva and generic AI tools. Generate high-converting branded promotional graphics, review drafts in 1 tap from your phone, and publish automatically across Instagram, Facebook, LinkedIn, YouTube, and X.",
    badgeText: "AI Social Media Autopilot for Businesses & Creators",
    primaryCtaText: "Start Free Pilot",
    primaryCtaLink: "/register",
    secondaryCtaText: "Explore Solutions",
    secondaryCtaLink: "/services",
  },
  announcement: {
    enabled: true,
    badge: "OFFICIAL APIS",
    text: "Meta Graph & Google Multi-Channel Scheduling with 100% Account Safety Active",
    linkText: "Learn more",
    linkUrl: "/services",
  },
  features: [
    {
      id: "poster-studio",
      title: "Branded Graphic Poster Studio",
      description:
        "High-resolution server-side typography engine. Automatically embed your verified business logo, phone number, and address footer onto every promotional creative in 0.4 seconds.",
      badge: "60 FPS Rasterization",
      icon: "Palette",
    },
    {
      id: "mobile-approvals",
      title: "1-Tap Mobile WhatsApp Approvals",
      description:
        "Never log into complex desktop dashboards. Review your monthly post batches directly on your phone via secure WhatsApp or Email links and tap Approve in 5 seconds.",
      badge: "Zero-Password Mobile Review",
      icon: "Smartphone",
    },
    {
      id: "anti-slop",
      title: "Turnitout Anti-Slop AI Humanizer",
      description:
        "Purges robotic AI buzzwords like 'delve' and 'testament'. Tailors hooks natively for Indian retail, clinics, salons, gyms, and professional services.",
      badge: "5-Platform Custom Copy",
      icon: "Zap",
    },
  ],
  services: [
    {
      id: "graphic-poster-engine",
      title: "Server-Side Promotional Graphic Engine",
      subtitle: "High-resolution branded posters in sub-400ms",
      description:
        "Built on Python Cairo vector rendering. Every generated promotional poster accurately renders with crisp typography, exact brand hex colors, and dynamic contact banners.",
      points: [
        "Instant rasterization under 400ms",
        "Auto-embedded business phone, address, and logo watermark",
        "Supports 1:1 Square, 4:5 Portrait, and 9:16 Story formats",
        "Curated festive and promotional business templates",
      ],
      icon: "Palette",
    },
    {
      id: "ai-copywriter",
      title: "Turnitout Anti-Slop Social Copywriter",
      subtitle: "High-converting hooks tailored for Indian commerce",
      description:
        "Trained on top-performing retail, clinic, salon, and hospitality social campaigns. Formats tailored captions for Instagram, Facebook, LinkedIn, YouTube, and Twitter with proper hashtag hygiene.",
      points: [
        "Authentic tone adapting to your unique brand voice kit",
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
      title: "Mobile-First WhatsApp Review System",
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
        "Standard AI Marketing Copywriter",
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
      description: "For active clinics, salons, gyms, and growing business brands.",
      popular: true,
      badge: "Most Popular",
      features: [
        "2 Brand Workspaces",
        "50 Branded Posters / month",
        "5-Platform Copy Multiplexer (FB, IG, LI, X, YT)",
        "WhatsApp Lead Click-to-Chat Integration",
        "Priority High-Speed Poster Render Queue",
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
      description: "For marketing agencies, multi-location franchises, and consultants.",
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
    brandName: "ABCD Social Hub",
    tagline: "Autonomous Multi-Tenant Marketing & Publishing",
    contactEmail: "sb.abcd321@gmail.com",
    contactPhone: "+91 8167685731",
    supportWhatsapp: "+91 8167685731",
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
