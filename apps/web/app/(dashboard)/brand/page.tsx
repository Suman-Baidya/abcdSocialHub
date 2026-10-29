"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";

export default function BrandKitPage() {
  const [businessName, setBusinessName] = useState("ABCD Social Hub");
  const [tagline, setTagline] = useState("AI Marketing Autopilot for Local Businesses");
  const [phoneNumber, setPhoneNumber] = useState("+91 8944899747");
  const [whatsappNumber, setWhatsappNumber] = useState("+91 8167685731");
  const [emailAddress, setEmailAddress] = useState("sb.abcd321@gmail.com");
  const [addressBanner, setAddressBanner] = useState("WhatsApp: +91 8167685731 • Email: sb.abcd321@gmail.com");
  const [primaryColor, setPrimaryColor] = useState("#00F0FF");
  const [defaultLanguage, setDefaultLanguage] = useState<"bengali" | "english">("bengali");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBrandKit() {
      try {
        const res = await fetch("/api/brand");
        const data = await res.json();
        if (data.brandKit) {
          setBusinessName(data.brandKit.businessName || "ABCD Social Hub");
          setTagline(data.brandKit.tagline || "");
          setPhoneNumber(data.brandKit.phoneNumber || "+91 8944899747");
          setAddressBanner(data.brandKit.addressBanner || "WhatsApp: +91 8167685731 • Email: sb.abcd321@gmail.com");
          setPrimaryColor(data.brandKit.primaryColor || "#00F0FF");
          setDefaultLanguage(data.brandKit.defaultLanguage || "bengali");
        }
      } catch (err) {
        console.error("Failed to load BrandKit:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBrandKit();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          tagline,
          phoneNumber,
          addressBanner: `WhatsApp: ${whatsappNumber} • Email: ${emailAddress}`,
          primaryColor,
          defaultLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save Brand Kit");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save Brand Kit");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00F0FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <PageBreadcrumb
        pageTitle="Brand Identity Kit"
        description="Configure your business contacts, colors, and typography for automated Pillow poster burning."
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs sm:text-sm transition-all shadow-md shadow-[#00F0FF]/20 disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-950" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Brand Kit</span>
            </>
          )}
        </button>
      </PageBreadcrumb>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Form Column */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* Card 1: Business Identity */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00F0FF]" />
              <span>Business Profile</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Business / Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="ABCD Social Hub"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="AI Marketing Autopilot"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Contact Information */}
          <div className="p-6 rounded-2xl bg-[#121722]/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#00F0FF]" />
              <span>Contact Channels (Printed on Posters)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Mobile Phone Number</span>
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 8944899747"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Business Number</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 8167685731"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>Support / Business Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="sb.abcd321@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Color Theme & Language */}
          <div className="p-6 rounded-2xl bg-[#121722]/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#00F0FF]" />
              <span>Visual Tone & Language Preference</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Primary Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Default Poster Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDefaultLanguage("bengali")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      defaultLanguage === "bengali"
                        ? "bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF]"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    বাংলা (Bengali)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultLanguage("english")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      defaultLanguage === "english"
                        ? "bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF]"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Live Poster Footer Preview */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Live Poster Footer Preview
          </div>

          <div className="p-4 rounded-2xl bg-[#121722]/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
            <div className="aspect-square rounded-xl bg-zinc-950 border border-zinc-800/80 relative overflow-hidden flex flex-col justify-between p-4 shadow-xl">
              {/* Top Bar with Monogram Emblem */}
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm text-[#0A0D14] shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {businessName.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                  1080 × 1080
                </span>
              </div>

              {/* Sample Creative Center */}
              <div className="text-center my-auto px-4">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#00F0FF] block mb-1">
                  {defaultLanguage === "bengali" ? "বিশেষ অফার" : "SPECIAL PROMOTION"}
                </span>
                <p className="text-xl font-extrabold text-white leading-tight">
                  {defaultLanguage === "bengali"
                    ? "আপনার ব্যবসার জন্য সেরা অফার"
                    : "Exclusive Limited Time Offer"}
                </p>
                <p className="text-xs text-zinc-400 mt-2">{tagline}</p>
              </div>

              {/* Live Branded Contact Footer Banner */}
              <div
                className="rounded-lg p-2.5 text-center text-[#0A0D14] shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="font-extrabold text-xs tracking-tight">{businessName}</div>
                <div className="text-[10px] font-semibold mt-0.5 opacity-90 truncate flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>{phoneNumber} • WhatsApp: {whatsappNumber}</span>
                </div>
                <div className="text-[9px] opacity-80 truncate">{emailAddress}</div>
              </div>
            </div>

            <p className="text-xs text-zinc-500 text-center">
              This branded contact banner is automatically burned into every generated social poster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
