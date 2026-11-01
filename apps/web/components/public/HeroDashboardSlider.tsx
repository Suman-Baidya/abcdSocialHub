"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Palette,
  Zap,
  ShieldCheck,
  Smartphone,
  Calendar,
  Layers,
  BarChart3,
  CheckCircle2,
  Clock,
  Send,
  Check,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  ArrowRight,
  TrendingUp,
  Coins,
} from "lucide-react";

export function HeroDashboardSlider() {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const slides = [
    {
      id: "ai-studio",
      tabLabel: "AI Autopilot Studio",
      icon: Sparkles,
      badge: "0.4s Fast Render",
    },
    {
      id: "calendar",
      tabLabel: "Multi-Channel Calendar",
      icon: Calendar,
      badge: "5 Networks Synced",
    },
    {
      id: "approvals",
      tabLabel: "WhatsApp 1-Tap Review",
      icon: Smartphone,
      badge: "Mobile Direct",
    },
    {
      id: "analytics",
      tabLabel: "Founder ROI Analytics",
      icon: BarChart3,
      badge: "Real-time Metrics",
    },
  ];

  // Auto-cycle slides every 5 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="mt-12 sm:mt-16 mb-16 sm:mb-24 relative mx-auto max-w-6xl rounded-3xl border border-border/80 bg-card/90 shadow-2xl backdrop-blur-2xl overflow-hidden hover:border-primary/40 transition-all duration-300"
    >
      {/* Top Ambient Highlight Beam */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

      {/* Mock Browser/App Chrome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3 border-b border-border/60 bg-muted/20 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[11px] text-foreground/80 hidden sm:inline">
            abcd-social.app / autopilot / live-preview
          </span>
        </div>

        {/* Interactive Slide Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {slides.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeSlide === idx;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSlide(idx)}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.tabLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider Viewport */}
      <div className="p-4 sm:p-7 min-h-[380px] sm:min-h-[410px] flex items-center justify-center">
        {/* ======================================================== */}
        {/* SLIDE 0: AI Autopilot Studio                            */}
        {/* ======================================================== */}
        {activeSlide === 0 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 text-left items-center animate-in fade-in duration-300">
            {/* Stage 1: Raw Idea */}
            <div className="lg:col-span-4 rounded-2xl bg-muted/40 border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary" /> 1. Raw Business Idea
                </span>
                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono">
                  Text / Voice
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border/80 text-xs text-foreground font-sans leading-relaxed shadow-2xs">
                &ldquo;Special Weekend Mega Health & Wellness Drive: Free vitals & blood sugar checkup, 15% discount on family health packages. Walk-ins welcome this Saturday & Sunday!&rdquo;
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Category: <strong>Healthcare & Retail Commerce</strong></span>
              </div>
            </div>

            {/* Stage 2: Autopilot Engine */}
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

            {/* Stage 3: Ready Post Output */}
            <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3" /> 3. WhatsApp 1-Tap Review
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">Instant Dispatch</span>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 space-y-2.5 shadow-2xs">
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
        )}

        {/* ======================================================== */}
        {/* SLIDE 1: Multi-Channel Calendar Scheduler               */}
        {/* ======================================================== */}
        {activeSlide === 1 && (
          <div className="w-full space-y-4 text-left animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>30-Day Marketing Operations Calendar</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Synchronized publishing across Instagram, Facebook, LinkedIn, YouTube, and X
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 w-fit">
                ● 14 Posts Queued This Week
              </span>
            </div>

            {/* Simulated Calendar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Event 1 */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground">Monday • 10:30 AM</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                    PUBLISHED
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                  &ldquo;Kickstart your week with wellness: 5 proven vitality habits for busy professionals.&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <Facebook className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-mono">1.2K Engagements</span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="p-3.5 rounded-2xl bg-card border border-primary/30 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground">Wednesday • 6:00 PM</span>
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10px]">
                    SCHEDULED
                  </span>
                </div>
                <p className="text-xs text-foreground font-medium line-clamp-2">
                  &ldquo;Exclusive Weekend Flash Offer: 20% off all health checks. Book via WhatsApp now!&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                  <Twitter className="w-3.5 h-3.5 text-zinc-300" />
                </div>
              </div>

              {/* Event 3 */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground">Saturday • 11:00 AM</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                    IN REVIEW
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                  &ldquo;Customer Spotlight: How Dr. Sen increased patient appointments by 40% with automated campaigns.&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <Facebook className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-mono">Shorts + Feed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SLIDE 2: WhatsApp 1-Tap Mobile Review                   */}
        {/* ======================================================== */}
        {activeSlide === 2 && (
          <div className="w-full max-w-xl mx-auto space-y-4 text-left animate-in fade-in duration-300">
            <div className="rounded-2xl border border-emerald-500/30 bg-card p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    A
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">ABCD Social WhatsApp Dispatch</h4>
                    <p className="text-[11px] text-muted-foreground">Official Automated Business Notification</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">
                  VERIFIED
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/50 border border-border/80 text-xs text-foreground space-y-2">
                <p className="font-semibold text-emerald-400">
                  ✨ Hi Doctor/Store Owner, your 5 promotional creatives for this week are ready!
                </p>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Batch: <strong>#WK-44 Weekend Campaign</strong> • Platforms: Instagram Business, Facebook Pages • Scheduled Time: Tomorrow 10:30 AM
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  className="py-2.5 px-4 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-emerald-400 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>1-Tap Approve & Publish</span>
                </button>
                <button
                  type="button"
                  className="py-2.5 px-4 rounded-xl bg-muted text-foreground font-semibold text-xs border border-border hover:bg-muted/80 transition-colors"
                >
                  Request Fast Edit
                </button>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              ⚡ Zero logins, zero passwords required on your smartphone.
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SLIDE 3: Founder ROI & Analytics Cockpit                 */}
        {/* ======================================================== */}
        {activeSlide === 3 && (
          <div className="w-full space-y-5 text-left animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>Founder Marketing Cockpit & ROI</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Measurable business growth without agency overhead
                </p>
              </div>
              <span className="text-[11px] font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                Live Ledger Synced
              </span>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Posters Rendered
                </div>
                <div className="text-2xl font-black text-foreground">48 / 50</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span>96% Monthly Quota Used</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Social Reach
                </div>
                <div className="text-2xl font-black text-foreground">124.8K</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span>+34.2% vs Last Month</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Time Saved
                </div>
                <div className="text-2xl font-black text-foreground">18.5 hrs</div>
                <div className="text-[10px] text-primary font-semibold flex items-center gap-1">
                  <span>~4.5 hrs / week</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Publish Success
                </div>
                <div className="text-2xl font-black text-emerald-400">99.8%</div>
                <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                  <span>Zero Ban Record</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slider Footer / Progress Dots */}
      <div className="px-5 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <span className="text-[11px]">
          Hover to pause • Auto-switching every 5 seconds
        </span>

        {/* Indicator Dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              aria-label={`Switch to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeSlide === idx
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
