"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Palette,
  Phone,
  MessageCircle,
  Mail,
  Building2,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  Check,
  Ratio,
  SlidersHorizontal,
  RefreshCw,
  Layers,
  ShieldCheck,
  Type,
  ArrowRight,
  Cpu,
  Stamp,
  CheckSquare,
  Zap,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { useToast } from "@/components/ui/ToastProvider";

// Curated Luxury Color Palettes designed for local Indian & Bengali businesses
const PRESET_PALETTES = [
  {
    id: "cyan-luxe",
    name: "Obsidian Cyan",
    primary: "#00F0FF",
    secondary: "#0A0D14",
    tag: "High Contrast",
  },
  {
    id: "emerald-velvet",
    name: "Emerald Velvet",
    primary: "#10B981",
    secondary: "#064E3B",
    tag: "Fresh / Organic",
  },
  {
    id: "sunset-amber",
    name: "Sunset Amber",
    primary: "#F59E0B",
    secondary: "#451A03",
    tag: "Festive Gold",
  },
  {
    id: "royal-sapphire",
    name: "Royal Sapphire",
    primary: "#3B82F6",
    secondary: "#172554",
    tag: "Corporate Tech",
  },
  {
    id: "crimson-rose",
    name: "Crimson Rose",
    primary: "#F43F5E",
    secondary: "#4C0519",
    tag: "Beauty / Glamour",
  },
  {
    id: "clean-slate",
    name: "Clean Slate",
    primary: "#64748B",
    secondary: "#0F172A",
    tag: "Minimal Modern",
  },
];

// Curated Business Niches for Indian Local Commerce
const BUSINESS_NICHES = [
  { id: "salon", label: "Salon & Spa / Grooming" },
  { id: "retail", label: "Boutique & Retail Store" },
  { id: "dining", label: "Restaurant & Sweet Shop" },
  { id: "health", label: "Clinic & Dental Care" },
  { id: "coaching", label: "Coaching & Academy" },
  { id: "services", label: "Local Home Services" },
];

export default function BrandKitPage() {
  const { toast } = useToast();

  // Core Brand Profile State
  const [businessName, setBusinessName] = useState("ABCD Social Hub");
  const [tagline, setTagline] = useState("AI Marketing Autopilot for Local Businesses");
  const [industryNiche, setIndustryNiche] = useState("salon");
  const [phoneNumber, setPhoneNumber] = useState("+91 8944899747");
  const [whatsappNumber, setWhatsappNumber] = useState("+91 8167685731");
  const [emailAddress, setEmailAddress] = useState("sb.abcd321@gmail.com");
  const [storeAddress, setStoreAddress] = useState("Salt Lake, Sector V, Kolkata, WB 700091");
  const [primaryColor, setPrimaryColor] = useState("#00F0FF");
  const [secondaryColor, setSecondaryColor] = useState("#0A0D14");
  const [defaultLanguage, setDefaultLanguage] = useState<"bengali" | "english" | "hindi">("bengali");
  const [toneVoice, setToneVoice] = useState<"urgent" | "festive" | "story" | "expert">("urgent");

  // Emblem & Layout Styling Options (Fills blank spot on right)
  const [monogramStyle, setMonogramStyle] = useState<"squircle" | "circle" | "pill">("squircle");
  const [emblemTheme, setEmblemTheme] = useState<"accent" | "dark" | "outline">("accent");

  // Preview Aspect Ratio State
  const [previewRatio, setPreviewRatio] = useState<"1:1" | "4:5">("1:1");

  // Lifecycle & UX States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to parse addressBanner into sub-fields
  const parseAddressBanner = useCallback((banner: string) => {
    if (!banner) return;
    const parts = banner.split("•").map((p) => p.trim());
    for (const part of parts) {
      if (part.toLowerCase().startsWith("whatsapp:")) {
        const val = part.replace(/whatsapp:\s*/i, "").trim();
        if (val) setWhatsappNumber(val);
      } else if (part.toLowerCase().startsWith("email:")) {
        const val = part.replace(/email:\s*/i, "").trim();
        if (val) setEmailAddress(val);
      } else if (part && !part.toLowerCase().startsWith("+91")) {
        setStoreAddress(part);
      }
    }
  }, []);

  // Fetch initial Brand Kit data
  useEffect(() => {
    async function loadBrandKit() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/brand");
        if (!res.ok) {
          throw new Error("Failed to load Brand Kit settings");
        }
        const data = await res.json();
        if (data.brandKit) {
          setBusinessName(data.brandKit.businessName || "ABCD Social Hub");
          setTagline(data.brandKit.tagline || "AI Marketing Autopilot for Local Businesses");
          setPhoneNumber(data.brandKit.phoneNumber || "+91 8944899747");
          setPrimaryColor(data.brandKit.primaryColor || "#00F0FF");
          setSecondaryColor(data.brandKit.secondaryColor || "#0A0D14");

          if (["bengali", "english", "hindi"].includes(data.brandKit.defaultLanguage)) {
            setDefaultLanguage(data.brandKit.defaultLanguage);
          }

          if (data.brandKit.addressBanner) {
            parseAddressBanner(data.brandKit.addressBanner);
          }
        }
      } catch (err: any) {
        console.error("BrandKit load error:", err);
        setError(err.message || "Failed to load brand data");
      } finally {
        setLoading(false);
      }
    }
    loadBrandKit();
  }, [parseAddressBanner]);

  // Compute profile completeness score (0-100%)
  const completenessScore = useMemo(() => {
    let score = 0;
    if (businessName.trim().length >= 2) score += 20;
    if (tagline.trim().length >= 5) score += 20;
    if (phoneNumber.trim().length >= 8) score += 20;
    if (whatsappNumber.trim().length >= 8) score += 20;
    if (emailAddress.trim().length >= 5) score += 10;
    if (storeAddress.trim().length >= 5) score += 10;
    return score;
  }, [businessName, tagline, phoneNumber, whatsappNumber, emailAddress, storeAddress]);

  // Monogram computation (e.g. "ABCD Social" -> "AB")
  const monogram = useMemo(() => {
    const parts = businessName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return businessName.slice(0, 2).toUpperCase() || "AB";
  }, [businessName]);

  // Handle Save
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);

    const compiledAddressBanner = `WhatsApp: ${whatsappNumber} • Email: ${emailAddress} • ${storeAddress}`;

    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          tagline,
          phoneNumber,
          addressBanner: compiledAddressBanner,
          primaryColor,
          secondaryColor,
          defaultLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save Brand Kit");
      }

      toast.success(
        "Brand Kit Saved",
        "Visual assets and automated contact footers updated successfully."
      );
    } catch (err: any) {
      setError(err?.message || "Failed to save Brand Kit");
      toast.error("Save Failed", err?.message || "Could not persist brand updates.");
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut (Ctrl/Cmd + S) to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [businessName, tagline, phoneNumber, whatsappNumber, emailAddress, storeAddress, primaryColor, secondaryColor, defaultLanguage]);

  // ─────────────────────────────────────────────────────────────
  // 1. Loading Skeleton State
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-5 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-card border border-border p-4" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-44 rounded-xl bg-card border border-border" />
            <div className="h-56 rounded-xl bg-card border border-border" />
          </div>
          <div className="lg:col-span-5 h-96 rounded-xl bg-card border border-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────────
          1. Enterprise Header (Strictly 2 Words Title, 7 Words Desc)
         ───────────────────────────────────────────────────────────── */}
      <PageBreadcrumb
        pageTitle="Brand Kit"
        description="Configure visual branding assets and contact footers."
        hideBreadcrumb={true}
      >
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Brand Kit</span>
            </>
          )}
        </button>
      </PageBreadcrumb>

      {/* ─────────────────────────────────────────────────────────────
          2. Error Banner State (With Retry)
         ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => handleSave()}
            className="text-xs font-semibold underline hover:opacity-80 cursor-pointer shrink-0"
          >
            Retry Save
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. KPI Summary Metric Grid (Number Highlighted First)
             2 boxes per row on mobile = 2 rows, 2 cols = 4 boxes
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
        {/* KPI 1: Brand Completeness */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Profile Health
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {completenessScore}%
            </h4>
            <span className="text-[11px] font-semibold text-emerald-500">
              {completenessScore === 100 ? "Ready" : "Complete"}
            </span>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="w-full bg-muted/60 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${completenessScore}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Target Canvas Standards */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Canvases Armed
            </span>
            <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
              <Ratio className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              2
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Aspect Ratios
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            1080×1080 (1:1) & 1080×1350 (4:5)
          </span>
        </div>

        {/* KPI 3: Contact Channels */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Burned Contacts
            </span>
            <div className="w-6 h-6 rounded-md bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-500">
              <Phone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              4
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Channels
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            Phone, WhatsApp, Email, Store
          </span>
        </div>

        {/* KPI 4: Typography Engine */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Font Pairing
            </span>
            <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
              <Type className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight truncate">
              {defaultLanguage === "bengali"
                ? "Noto Bengali"
                : defaultLanguage === "hindi"
                ? "Noto Hindi"
                : "Inter Display"}
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {defaultLanguage === "english" ? "Default" : "+ Inter"}
            </span>
          </div>
          <span className="text-[10px] text-emerald-500 font-medium block mt-2">
            Zero Regional Glyph Clipping
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Main Configuration & Real-Time Canvas Layout
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column: Form Settings (7 cols on lg) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-4">
          {/* Card 1: Business Identity & Monogram */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  Business Identity
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">
                Public Header & Branding
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {/* Business Name */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Business / Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. ABCD Social Hub"
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Brand Hook / Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. AI Marketing Autopilot"
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Industry Niche */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Commercial Industry / Niche
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {BUSINESS_NICHES.map((niche) => (
                    <button
                      key={niche.id}
                      type="button"
                      onClick={() => setIndustryNiche(niche.id)}
                      className={`p-2 rounded-xl border text-[11px] font-semibold text-left transition-all cursor-pointer ${
                        industryNiche === niche.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {niche.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Contact Channels Burned into Footers */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  Contact Footers
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Printed on Creatives
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {/* Phone */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Calling Phone Number</span>
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 8944899747"
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground text-xs sm:text-sm font-mono focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp VIP Number</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 8167685731"
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground text-xs sm:text-sm font-mono focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-500" />
                  <span>Support / Inquiries Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="sb.abcd321@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground text-xs sm:text-sm font-mono focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Physical Store Address */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Store Location / Regional Landmark</span>
                </label>
                <input
                  type="text"
                  required
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="e.g. Salt Lake, Sector V, Kolkata"
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Color Palette & Visual Theme */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  Color Palette
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">
                Accent & Contrast
              </span>
            </div>

            {/* Curated Presets */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Luxury Color Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_PALETTES.map((preset) => {
                  const isSelected = primaryColor.toLowerCase() === preset.primary.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(preset.primary);
                        setSecondaryColor(preset.secondary);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40"
                          : "bg-muted/40 border-border hover:bg-muted"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg border border-white/20 shrink-0 shadow-sm"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-foreground block truncate">
                          {preset.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {preset.primary}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hex Color Picker */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Custom Accent Color
              </label>
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0 block"
                    aria-label="Pick custom primary color"
                  />
                </div>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#00F0FF"
                  className="w-36 px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-mono text-xs sm:text-sm uppercase focus:outline-none focus:border-primary/50"
                />
                <span className="text-[11px] text-muted-foreground">
                  Applied to CTA buttons, monograms & poster headers.
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Language & Regional Typography (Includes Bengali, Hindi & English) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  Language & Tone
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">
                Regional Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {/* Default Language Selector with Bengali, Hindi, English */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Default Poster Language (3 Regional Engines Supported)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDefaultLanguage("bengali")}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                      defaultLanguage === "bengali"
                        ? "bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/40 font-bold"
                        : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    বাংলা (Bengali)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultLanguage("hindi")}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                      defaultLanguage === "hindi"
                        ? "bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/40 font-bold"
                        : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultLanguage("english")}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                      defaultLanguage === "english"
                        ? "bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/40 font-bold"
                        : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Tone of Voice */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Default Campaign Voice
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: "urgent", label: "Urgent Offer" },
                    { id: "festive", label: "Festive Joy" },
                    { id: "story", label: "Storytelling" },
                    { id: "expert", label: "Value / Tips" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setToneVoice(t.id as any)}
                      className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition-all cursor-pointer ${
                        toneVoice === t.id
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Right Column: Balanced Layout with Real-Time Canvas Preview & Engine Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Section 1: Live Poster Simulation Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Live Poster Simulation
              </span>
              {/* Canvas Aspect Ratio Switcher */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setPreviewRatio("1:1")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    previewRatio === "1:1"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  1:1 Square
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRatio("4:5")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    previewRatio === "4:5"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  4:5 Portrait
                </button>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3">
              {/* Live Canvas Mockup */}
              <div
                className={`w-full rounded-2xl bg-[#080B11] border border-white/10 relative overflow-hidden flex flex-col justify-between p-4 shadow-2xl transition-all duration-300 ${
                  previewRatio === "1:1" ? "aspect-square" : "aspect-[4/5]"
                }`}
              >
                {/* Top Header: Monogram Emblem + Brand Name + Canvas Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center font-extrabold text-xs shadow-md transition-all ${
                        monogramStyle === "circle"
                          ? "w-8 h-8 rounded-full"
                          : monogramStyle === "pill"
                          ? "px-2.5 h-7 rounded-full text-[10px]"
                          : "w-8 h-8 rounded-xl"
                      }`}
                      style={{
                        backgroundColor:
                          emblemTheme === "accent"
                            ? primaryColor
                            : emblemTheme === "dark"
                            ? "#121722"
                            : "transparent",
                        color:
                          emblemTheme === "accent"
                            ? "#080B11"
                            : emblemTheme === "dark"
                            ? primaryColor
                            : primaryColor,
                        border:
                          emblemTheme === "outline" ? `1.5px solid ${primaryColor}` : "none",
                      }}
                    >
                      {monogram}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block tracking-tight">
                        {businessName}
                      </span>
                      <span className="text-[9px] text-zinc-400 block -mt-0.5">
                        {tagline}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono">
                    {previewRatio === "1:1" ? "1080×1080" : "1080×1350"}
                  </span>
                </div>

                {/* Creative Center Mockup with Authentic Hindi / Bengali / English Copy */}
                <div className="text-center my-auto px-2 space-y-2">
                  <span
                    className="text-[10px] font-extrabold tracking-wider uppercase inline-block px-2.5 py-0.5 rounded-full transition-colors"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                      borderColor: `${primaryColor}40`,
                      borderWidth: "1px",
                    }}
                  >
                    {defaultLanguage === "bengali"
                      ? "বিশেষ উৎসব অফার"
                      : defaultLanguage === "hindi"
                      ? "विशेष उत्सव ऑफर"
                      : "LIMITED FESTIVE OFFER"}
                  </span>

                  <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                    {defaultLanguage === "bengali"
                      ? "আপনার পরিবারের জন্য সেরা উৎসবের সাজ"
                      : defaultLanguage === "hindi"
                      ? "आपके परिवार के लिए सबसे खास उत्सव का अनुभव"
                      : "Experience Premium Festive Luxury"}
                  </h3>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 max-w-xs mx-auto leading-relaxed">
                    {defaultLanguage === "bengali"
                      ? "এই উইকএন্ডে ফ্ল্যাট ৩৫% ছাড় উপভোগ করুন। আজই অগ্রিম বুকিং নিশ্চিত করুন।"
                      : defaultLanguage === "hindi"
                      ? "इस वीकेंड पर सभी प्रीमियम सेवाओं पर फ्लैट 35% छूट। आज ही बुक करें।"
                      : "Enjoy flat 35% discount on all premium salon & spa packages this weekend."}
                  </p>

                  {/* Simulated Call-To-Action Pill */}
                  <div className="pt-1">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-[#080B11] shadow-sm transition-colors"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>
                        {defaultLanguage === "bengali"
                          ? "হোয়াটসঅ্যাপ বুকিং চালু"
                          : defaultLanguage === "hindi"
                          ? "व्हाट्सएप पर संपर्क करें"
                          : "WhatsApp Booking Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Automated Printed Contact Footer Banner (Burned onto Creatives) */}
                <div className="rounded-xl p-2.5 bg-black/60 border border-white/10 text-white backdrop-blur-md shadow-lg space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-white">
                    <span className="truncate">{businessName}</span>
                    <span
                      className="text-[10px] font-bold font-mono transition-colors"
                      style={{ color: primaryColor }}
                    >
                      {phoneNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-zinc-400 border-t border-white/10 pt-1">
                    <span className="truncate flex items-center gap-1">
                      <MessageCircle className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                      <span>WhatsApp: {whatsappNumber}</span>
                    </span>
                    <span className="truncate max-w-[45%] text-right font-mono">
                      {emailAddress}
                    </span>
                  </div>

                  {storeAddress && (
                    <div className="text-[8px] text-zinc-400 truncate flex items-center gap-1 border-t border-white/5 pt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      <span className="truncate">{storeAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                This branded contact banner is automatically rendered into every generated poster by the high-precision Cairo engine.
              </p>
            </div>
          </div>

          {/* Section 2: Monogram Emblem & Watermark Style (Fills Blank Spot) */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-card border border-border shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                  <Stamp className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  Monogram Emblem Style
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">
                Top Corner Badge
              </span>
            </div>

            {/* Shape Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Emblem Badge Shape
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "squircle", label: "Squircle Box" },
                  { id: "circle", label: "Full Circle" },
                  { id: "pill", label: "Minimal Pill" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setMonogramStyle(s.id as any)}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer text-center ${
                      monogramStyle === s.id
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                        : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Emblem Color Theme */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Emblem Color Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "accent", label: "Accent Solid" },
                  { id: "dark", label: "Obsidian Core" },
                  { id: "outline", label: "Glass Outline" },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setEmblemTheme(theme.id as any)}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer text-center ${
                      emblemTheme === theme.id
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                        : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Cairo Poster Rendering Engine Specifications (Fills Blank Spot) */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  Creative Engine Specs
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Cairo 3.11 Vector
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Vector Resolution
                </span>
                <span className="font-semibold text-foreground">300 DPI Export</span>
              </div>

              <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Regional Font Stack
                </span>
                <span className="font-semibold text-foreground">Bengali, Hindi, Latin</span>
              </div>

              <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Contact Guard
                </span>
                <span className="font-semibold text-emerald-500">Zero Text Overlap</span>
              </div>

              <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Color Profile
                </span>
                <span className="font-semibold text-foreground">Rec. 709 / sRGB</span>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/content"
                className="w-full py-2.5 px-3 rounded-xl bg-muted hover:bg-accent text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-border cursor-pointer shadow-xs active:scale-95"
              >
                <span>Draft Live Post in Content Studio</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
