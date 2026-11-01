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
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Lock,
  Wifi,
  Battery,
} from "lucide-react";

export function MacBookShowcase() {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const slides = [
    {
      id: "ai-studio",
      title: "AI Autopilot Studio",
      shortTitle: "AI Studio",
      tagline: "Turn raw ideas into branded creatives in 0.4s",
      badge: "0.4s Fast Render",
      icon: Sparkles,
    },
    {
      id: "calendar",
      title: "Multi-Channel Calendar",
      shortTitle: "30-Day Queue",
      tagline: "Synchronized publishing across 5 official networks",
      badge: "5 Networks Synced",
      icon: Calendar,
    },
    {
      id: "approvals",
      title: "WhatsApp 1-Tap Review",
      shortTitle: "WhatsApp Review",
      tagline: "Review and publish straight from your phone chat",
      badge: "Mobile Direct",
      icon: Smartphone,
    },
    {
      id: "analytics",
      title: "Founder ROI Cockpit",
      shortTitle: "ROI Analytics",
      tagline: "Transparent growth ledger and zero ban record",
      badge: "Real-time Metrics",
      icon: BarChart3,
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

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full"
    >
      {/* =================================================================== */}
      {/* DESKTOP & TABLET: FULL-SCREEN TYPE MACBOOK BROWSER SHOWCASE        */}
      {/* =================================================================== */}
      <div className="hidden sm:block">
        <div className="relative mx-auto max-w-6xl rounded-[2.2rem] p-3 sm:p-4 bg-gradient-to-b from-border/90 via-muted/40 to-border/80 shadow-2xl border border-border/80">
          {/* MacBook Top Bezel with Camera Notch */}
          <div className="relative w-full rounded-[1.8rem] overflow-hidden bg-card border border-border/70 shadow-inner">
            {/* MacBook Webcam Dot */}
            <div className="h-4 bg-muted/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/20 border border-foreground/30 shadow-xs" />
            </div>

            {/* macOS Browser Chrome Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-border/60 bg-muted/30 gap-4">
              {/* macOS Window Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 rounded-full bg-rose-500/90 shadow-xs cursor-pointer hover:opacity-80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/90 shadow-xs cursor-pointer hover:opacity-80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-xs cursor-pointer hover:opacity-80" />
                <div className="hidden md:flex items-center gap-1.5 ml-3 text-muted-foreground/60">
                  <ChevronLeft className="w-3.5 h-3.5 cursor-pointer hover:text-foreground" onClick={handlePrev} />
                  <ChevronRight className="w-3.5 h-3.5 cursor-pointer hover:text-foreground" onClick={handleNext} />
                  <RotateCw className="w-3 h-3 cursor-pointer hover:text-foreground ml-1" />
                </div>
              </div>

              {/* Centered URL Address Bar */}
              <div className="flex-1 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-card/90 border border-border/80 shadow-2xs text-[11px] font-mono text-muted-foreground">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span className="text-foreground font-semibold">abcd-social.app</span>
                  <span className="text-muted-foreground/60">/ autopilot / live-preview</span>
                </div>
              </div>

              {/* Slide Navigation Dots */}
              <div className="flex items-center gap-1.5 shrink-0">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeSlide === idx
                        ? "w-6 bg-primary"
                        : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Feature Tabs Selector */}
            <div className="flex items-center justify-between border-b border-border/50 px-4 sm:px-6 py-2.5 bg-muted/15 overflow-x-auto no-scrollbar gap-2">
              <div className="flex items-center gap-2">
                {slides.map((s, idx) => {
                  const Icon = s.icon;
                  const isActive = activeSlide === idx;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSlide(idx)}
                      type="button"
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{s.title}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{slides[activeSlide].tagline}</span>
              </div>
            </div>

            {/* MacBook Screen Viewport (Carousels) */}
            <div className="p-6 sm:p-8 min-h-[420px] flex items-center justify-center relative">
              {/* Left/Right Floating Arrows */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Feature"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/90 border border-border shadow-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Feature"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/90 border border-border shadow-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* SLIDE 0: AI Autopilot Studio */}
              {activeSlide === 0 && (
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-5 text-left items-center animate-in fade-in duration-300">
                  <div className="md:col-span-4 rounded-2xl bg-muted/40 border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-primary" /> 1. Raw Business Idea
                      </span>
                      <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono">
                        Voice / Text
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

                  <div className="hidden md:block md:col-span-4 rounded-2xl bg-muted/40 border border-primary/30 p-4 space-y-3 relative shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Bot className="w-3 h-3" /> 2. Autopilot Engine
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

                  <div className="md:col-span-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3" /> 3. WhatsApp 1-Tap Ready
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">Auto-Dispatch</span>
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
                      Zero login required on phone
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 1: Multi-Channel Calendar */}
              {activeSlide === 1 && (
                <div className="w-full max-w-4xl space-y-4 text-left animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-foreground flex items-center gap-2">
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              {/* SLIDE 2: WhatsApp 1-Tap Review */}
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
                        className="py-2.5 px-4 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-emerald-400 transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>1-Tap Approve & Publish</span>
                      </button>
                      <button
                        type="button"
                        className="py-2.5 px-4 rounded-xl bg-muted text-foreground font-semibold text-xs border border-border hover:bg-muted/80 transition-colors cursor-pointer"
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

              {/* SLIDE 3: Founder ROI & Analytics Cockpit */}
              {activeSlide === 3 && (
                <div className="w-full max-w-4xl space-y-5 text-left animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-foreground flex items-center gap-2">
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

            {/* Bottom MacBook Status Bar */}
            <div className="px-5 py-2 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-[11px]">
                Hover to pause • Auto-switching every 5s
              </span>
              <span className="text-[11px] font-mono">
                Slide {activeSlide + 1} of {slides.length}
              </span>
            </div>
          </div>

          {/* MacBook Bottom Base Stand Bevel */}
          <div className="mt-1 h-3.5 mx-auto max-w-[420px] rounded-b-xl bg-gradient-to-b from-muted to-border/70 border-x border-b border-border/80 shadow-md" />
        </div>
      </div>

      {/* =================================================================== */}
      {/* MOBILE SCREEN: NATIVE SMARTPHONE CAROUSEL SHOWCASE                 */}
      {/* =================================================================== */}
      <div className="block sm:hidden px-2">
        <div className="relative mx-auto max-w-[340px] rounded-[2.5rem] p-3 bg-gradient-to-b from-border/90 via-muted/30 to-border/90 border-2 border-border shadow-2xl">
          {/* Smartphone Inner Screen */}
          <div className="rounded-[2rem] overflow-hidden bg-card border border-border/80 shadow-inner flex flex-col">
            {/* Dynamic Island & Status Bar */}
            <div className="pt-2 px-4 pb-1.5 flex items-center justify-between bg-card text-[11px] text-foreground font-semibold">
              <span>9:41</span>
              {/* Dynamic Island pill */}
              <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-primary" />
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* App Header */}
            <div className="px-3.5 py-2 border-b border-border/60 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">
                  A
                </div>
                <span className="text-xs font-bold text-foreground">ABCD Autopilot</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                LIVE
              </span>
            </div>

            {/* Mobile Carousel Tabs */}
            <div className="flex items-center gap-1 px-2.5 py-2 overflow-x-auto no-scrollbar border-b border-border/40 bg-muted/10">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlide(idx)}
                  type="button"
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-all ${
                    activeSlide === idx
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {s.shortTitle}
                </button>
              ))}
            </div>

            {/* Mobile Viewport Slide Content */}
            <div className="p-3.5 min-h-[310px] flex flex-col justify-center text-left">
              {/* Mobile Slide 0: AI Autopilot */}
              {activeSlide === 0 && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> 1. Voice / Text Input
                    </span>
                    <p className="text-xs text-foreground leading-snug">
                      &ldquo;Weekend Mega Health Camp: Free checkup & 15% discount on family packages.&rdquo;
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-card border border-emerald-500/30 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> 2. Poster Generated (0.4s)
                    </span>
                    <div className="p-2.5 rounded-lg bg-card border border-border text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Brand Logo: Included</span>
                        <span className="text-emerald-400 font-bold">✓</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Pricing: ₹0 Free Checkup</span>
                        <span className="text-emerald-400 font-bold">✓</span>
                      </div>
                    </div>
                    <div className="py-1.5 px-3 rounded-lg bg-emerald-500 text-black text-center text-xs font-bold shadow-xs">
                      Ready for WhatsApp Review
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Slide 1: Calendar Queue */}
              {activeSlide === 1 && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Upcoming Queue
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">14 Posts</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-border space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-[11px]">Today • 10:30 AM</span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">PUBLISHED</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] line-clamp-1">5 habits for busy founders</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Instagram className="w-3 h-3 text-pink-500" />
                      <Facebook className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-primary/30 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-[11px]">Wed • 6:00 PM</span>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">SCHEDULED</span>
                    </div>
                    <p className="text-foreground text-[11px] line-clamp-1">Weekend Flash Sale Offer</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Instagram className="w-3 h-3 text-pink-500" />
                      <Linkedin className="w-3 h-3 text-sky-400" />
                      <Twitter className="w-3 h-3 text-zinc-300" />
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Slide 2: WhatsApp Review */}
              {activeSlide === 2 && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="rounded-xl border border-emerald-500/40 bg-card p-3 space-y-2 shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Message
                      </span>
                      <span className="text-[9px] text-emerald-400 font-mono">10:30 AM</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      ✨ Hi Doctor/Owner, your 5 creatives are ready for this week!
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        className="py-2 px-2.5 rounded-lg bg-emerald-500 text-black font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>1-Tap Publish</span>
                      </button>
                      <button
                        type="button"
                        className="py-2 px-2.5 rounded-lg bg-muted text-foreground font-semibold text-[11px]"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground">
                    Zero login or password needed on mobile
                  </p>
                </div>
              )}

              {/* Mobile Slide 3: ROI Cockpit */}
              {activeSlide === 3 && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" /> Monthly ROI
                    </span>
                    <span className="text-[9px] text-primary font-mono">Ledger Live</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground">Posters</div>
                      <div className="text-lg font-black text-foreground">48/50</div>
                      <div className="text-[9px] text-emerald-400">96% quota</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground">Reach</div>
                      <div className="text-lg font-black text-foreground">124.8K</div>
                      <div className="text-[9px] text-emerald-400">+34% growth</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground">Hours Saved</div>
                      <div className="text-lg font-black text-foreground">18.5h</div>
                      <div className="text-[9px] text-primary">~4.5h/week</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground">Safety</div>
                      <div className="text-lg font-black text-emerald-400">99.8%</div>
                      <div className="text-[9px] text-muted-foreground">Zero ban</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Phone Navigation Bar */}
            <div className="p-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeSlide === idx ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
