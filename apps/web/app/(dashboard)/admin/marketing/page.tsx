"use client";

import { useState, useEffect } from "react";
import {
  Rocket,
  Search,
  Users,
  TrendingUp,
  MessageSquare,
  Copy,
  Check,
  Sparkles,
  DollarSign,
  Phone,
  MapPin,
  Building2,
  Video,
  Twitter,
  Linkedin,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { StatCard, LoadingSkeleton, EmptyState } from "@/components/common";

interface Lead {
  id: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  rating: string;
  suggestedPitch: {
    bn: string;
    en: string;
  };
}

interface Metrics {
  totalUsers: number;
  totalWorkspaces: number;
  totalContentGenerated: number;
  totalCreditsConsumed: number;
  financials: {
    projectedMRR: number;
    vpsServerCost: number;
    totalAiCost: number;
    totalCOGS: number;
    grossProfit: number;
    grossMarginPct: number;
  };
}

export default function FounderMarketingCockpitPage() {
  const [activeTab, setActiveTab] = useState<"prospector" | "storyteller" | "economics">("prospector");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Harvey Prospector State
  const [city, setCity] = useState("Kolkata");
  const [category, setCategory] = useState("salon");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [pitchLang, setPitchLang] = useState<"bn" | "en">("bn");

  // Metrics State
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Interactive Economics Calculator
  const [simClients, setSimClients] = useState(25);
  const [simPlanPrice, setSimPlanPrice] = useState(499);

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch(`/api/admin/leads?city=${encodeURIComponent(city)}&category=${encodeURIComponent(category)}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to load metrics:", err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchMetrics();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Build-in-Public Storyteller Templates
  const stories = [
    {
      id: "story_1",
      title: "Why Indian Local Business Owners Will Never Log In",
      xHook: `Most SaaS builders make the fatal mistake of building complex desktop dashboards for local business owners.\n\nHere's the reality: Salons, clinics & gyms don't have laptops behind the desk. They live 100% on WhatsApp.\n\nThat's why at ABCD Social, our primary UI is a 1-tap mobile magic-link. Zero password. 5-second review.`,
      linkedInStory: `Building for India's 60M+ local service businesses taught me one brutal lesson:\n\nIf your software requires opening a laptop, logging in, or tweaking design sliders — the owner will churn in 14 days.\n\nLocal salon and clinic owners aren't lazy; they are on their feet serving customers 12 hours a day. They don't have time for Canva or complex dashboards.\n\nWe engineered ABCD Social around a simple premise:\n1. The AI drafts the 1080×1080 Bengali/English poster automatically.\n2. The owner receives a WhatsApp magic link.\n3. They tap "Approve" with one thumb in 5 seconds.\n\nMeet your users where they actually work. For India, that's WhatsApp.`,
      videoScript: `Hook: "Here is why 90% of marketing tools fail in India..."\nScene 1: Show a busy salon in Kolkata with hair stylists at work.\nScene 2: "Business owners don't want another login screen. They want clients."\nScene 3: Show phone receiving WhatsApp notification with 1-tap Approve button.\nScene 4: "Tap Approve. Done. AI publishes to Instagram & Facebook instantly."`,
    },
    {
      id: "story_2",
      title: "The Zero-Cost Bengali AI Poster Engine",
      xHook: `Canva cannot render Bengali ligatures (যুক্তাক্ষর) reliably without broken glyphs.\n\nWe built a custom Pillow + GNU Cairo rendering engine with Noto Sans Bengali running on a $12 VPS.\n\nResult: 1080×1080 localized posters rendered and uploaded to Cloudinary CDN in < 450ms. Zero cloud GPUs needed.`,
      linkedInStory: `Why regional language marketing is the biggest untapped frontier in Indian SaaS:\n\nEnglish marketing copy has 5-8% engagement in Tier 2/3 cities. Conversational Bengali copy has 34%+ engagement.\n\nYet, almost every poster generation tool clips Bengali matras and breaks conjunct consonants.\n\nWe solved this with a dedicated microservice isolating Indic font shaping using Noto Sans Bengali and GNU Cairo.\n\nTotal cloud cost per generated poster? ₹0.08. Margin? 92%.\n\nHyper-localization always wins.`,
      videoScript: `Hook: "Why did we build our own regional poster engine?"\nScene 1: Screen showing broken Bengali text in generic tools vs crisp rendered poster in ABCD Social.\nScene 2: "1080×1080 promotional creative with logo, phone number, and address burned automatically."\nScene 3: "Real local reach for local businesses."`,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────────
          1. Canonical Page Breadcrumb Header (2-3 Words Title, 7-8 Words Desc)
         ───────────────────────────────────────────────────────────── */}
      <PageBreadcrumb
        pageTitle="Founder Cockpit"
        description="Organic customer prospecting, build-in-public stories, and unit economics."
        hideBreadcrumb={true}
      >
        <button
          type="button"
          onClick={() => {
            fetchLeads();
            fetchMetrics();
          }}
          disabled={loadingMetrics || loadingLeads}
          className="p-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Refresh metrics and leads"
        >
          <RefreshCw className={`w-4 h-4 ${loadingMetrics ? "animate-spin text-primary" : ""}`} />
        </button>
      </PageBreadcrumb>

      {/* ─────────────────────────────────────────────────────────────
          2. Standard KPI & Metric Summary Grid (4 Reusable StatCards)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
        <StatCard
          title="Workspaces"
          value={metrics?.totalWorkspaces || 1}
          subtitle="Multi-Tenant"
          icon={Building2}
          variant="amber"
          badge={{ text: "Multi-Tenant", variant: "neutral" }}
        />
        <StatCard
          title="Posts Generated"
          value={metrics?.totalContentGenerated || 0}
          subtitle="AI Engine"
          icon={Sparkles}
          variant="primary"
          badge={{ text: "AI Engine", variant: "info" }}
        />
        <StatCard
          title="Gross Margin"
          value={`${metrics?.financials.grossMarginPct || 92}%`}
          subtitle="Software Margin"
          icon={TrendingUp}
          variant="emerald"
          badge={{ text: "> 85% Target", variant: "success" }}
        />
        <StatCard
          title="Projected MRR"
          value={`₹${(metrics?.financials.projectedMRR || 499).toLocaleString("en-IN")}`}
          subtitle="Monthly Recurring"
          icon={DollarSign}
          variant="sky"
          badge={{ text: "Live Run-Rate", variant: "info" }}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. Informational Strategy Banner
         ───────────────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-card border border-border shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
            <Rocket className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">
              Autonomous Growth Engine
            </h3>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Zero-cost local prospecting, viral build-in-public hooks, and transparent unit margin simulation.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-0.5 rounded-md bg-muted border border-border shrink-0">
          Founder Suite
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Main Navigation Tabs (Semantic Design Tokens)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: "prospector", name: "1. Local B2B Prospector", icon: Search, badge: "Harvey" },
          { id: "storyteller", name: "2. Build-in-Public Storyteller", icon: Rocket, badge: "Viral" },
          { id: "economics", name: "3. Unit Economics Ledger", icon: TrendingUp, badge: "Wally" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                active
                  ? "bg-primary/10 text-primary border border-primary/25 shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full border ${
                  active
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: Local B2B Prospector
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "prospector" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  <span>Local Business Prospector & Cold WhatsApp Pitch</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Finds salons, clinics, gyms & tutors via OpenStreetMap (100% free, zero Google Places API costs).
                </p>
              </div>

              {/* Outreach Language Toggle */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPitchLang("bn")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    pitchLang === "bn"
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  বাংলা (BN)
                </button>
                <button
                  type="button"
                  onClick={() => setPitchLang("en")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    pitchLang === "en"
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  City / Location
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                >
                  <option value="Kolkata">Kolkata (Park Street / Gariahat)</option>
                  <option value="Salt Lake">Salt Lake / New Town</option>
                  <option value="Howrah">Howrah / Bally</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Business Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                >
                  <option value="salon">Hair & Beauty Salons</option>
                  <option value="dentist">Dental Clinics</option>
                  <option value="gym">Fitness Gyms & Yoga</option>
                  <option value="auto">Car & Bike Repair</option>
                  <option value="tutor">Tuition & Coaching</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchLeads}
                  disabled={loadingLeads}
                  className="w-full py-2 px-4 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm cursor-pointer"
                >
                  {loadingLeads ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Search Prospects</span>
                </button>
              </div>
            </div>
          </div>

          {/* Prospects List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Discovered Local Businesses</h2>
              </div>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                {leads.length} Leads Ready
              </span>
            </div>

            {loadingLeads ? (
              <LoadingSkeleton type="cards" count={3} />
            ) : leads.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No leads found"
                description="Try searching with a different city or business category above."
                actionText="Refresh Prospects"
                onAction={fetchLeads}
              />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {leads.map((lead) => {
                  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                  const pitch = lead.suggestedPitch[pitchLang];
                  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(pitch)}`;

                  return (
                    <div
                      key={lead.id}
                      className="p-4 sm:p-4.5 rounded-2xl border border-border bg-card hover:border-primary/40 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">{lead.name}</h3>
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full capitalize">
                            {lead.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                            ⭐ {lead.rating}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-primary" />
                            <span>{lead.phone}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>{lead.address}</span>
                          </span>
                        </div>

                        {/* Pitch preview box */}
                        <div className="mt-2 p-2.5 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground italic font-sans">
                          &ldquo;{pitch.slice(0, 110)}...&rdquo;
                        </div>
                      </div>

                      {/* 1-Tap WhatsApp outreach button */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        <button
                          onClick={() => copyToClipboard(pitch, `pitch_${lead.id}`)}
                          className="p-2.5 rounded-xl bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-xs font-semibold transition-all shadow-sm cursor-pointer"
                          title="Copy Pitch Message"
                        >
                          {copiedKey === `pitch_${lead.id}` ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Send WhatsApp Pitch</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: Build-in-Public Launch Storyteller
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "storyteller" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
            <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" />
              <span>Build-in-Public Viral Storyteller</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Pre-crafted viral posts, X threads & short video scripts from your shipped code milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-bold text-foreground">{story.title}</h3>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest bg-muted px-2.5 py-0.5 rounded-full border border-border">
                    Viral Framework
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                  {/* Column 1: X (Twitter) Hook */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Twitter className="w-3.5 h-3.5 text-sky-500" />
                          <span>X (Twitter) Thread</span>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
                        {story.xHook}
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(story.xHook, `x_${story.id}`)}
                      className="w-full mt-3 py-2 rounded-lg bg-card hover:bg-muted text-xs font-semibold text-foreground border border-border flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-98"
                    >
                      {copiedKey === `x_${story.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy X Post</span>
                    </button>
                  </div>

                  {/* Column 2: LinkedIn Story */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                          <span>LinkedIn Founder Story</span>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans max-h-48 overflow-y-auto pr-1">
                        {story.linkedInStory}
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(story.linkedInStory, `li_${story.id}`)}
                      className="w-full mt-3 py-2 rounded-lg bg-card hover:bg-muted text-xs font-semibold text-foreground border border-border flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-98"
                    >
                      {copiedKey === `li_${story.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy LinkedIn Post</span>
                    </button>
                  </div>

                  {/* Column 3: 30s Short Video Teaser */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Video className="w-3.5 h-3.5 text-purple-500" />
                          <span>30s Video Script (Shorts/Reels)</span>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans max-h-48 overflow-y-auto pr-1">
                        {story.videoScript}
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(story.videoScript, `vid_${story.id}`)}
                      className="w-full mt-3 py-2 rounded-lg bg-card hover:bg-muted text-xs font-semibold text-foreground border border-border flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-98"
                    >
                      {copiedKey === `vid_${story.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Video Script</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: Unit Economics & Margin Calculator
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "economics" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
            <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Unit Economics & Profit Run-Rate Calculator</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Live margin simulator factoring single-VPS server hosting, AI inference tokens, and Cloudinary CDN storage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Sliders */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-sm space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-foreground mb-2">
                  <span>Paying Workspaces / Clients</span>
                  <span className="text-primary font-bold">{simClients} Clients</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={simClients}
                  onChange={(e) => setSimClients(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-foreground mb-2">
                  <span>Subscription Tier</span>
                  <span className="text-amber-500 font-bold">₹{simPlanPrice}/month</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSimPlanPrice(499)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      simPlanPrice === 499
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Starter (₹499/mo)
                  </button>
                  <button
                    onClick={() => setSimPlanPrice(999)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      simPlanPrice === 999
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Growth (₹999/mo)
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Dokploy VPS (Hetzner 4 vCPU):</span>
                  <span className="text-foreground font-medium">₹1,000 / mo</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>AI Copy & Poster (₹0.08 / gen):</span>
                  <span className="text-foreground font-medium">~₹{Math.round(simClients * 50 * 0.08)} / mo</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Cloudinary Media Storage:</span>
                  <span className="text-emerald-500 font-medium">₹0 (Free 25GB)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Projections */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-sm space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    Projected Monthly Revenue
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
                    ₹{(simClients * simPlanPrice).toLocaleString("en-IN")}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  MRR based on {simClients} paying accounts at ₹{simPlanPrice}/mo.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-sm space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
                    Annual Run Rate (ARR)
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
                    ₹{(simClients * simPlanPrice * 12).toLocaleString("en-IN")}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Annualized run-rate revenue.</p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-sm space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Software Gross Margin</span>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {Math.round(
                      (((simClients * simPlanPrice) - (1000 + simClients * 50 * 0.08)) /
                        (simClients * simPlanPrice)) *
                        100
                    )}% Net Margin
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          20,
                          Math.round(
                            (((simClients * simPlanPrice) - (1000 + simClients * 50 * 0.08)) /
                              (simClients * simPlanPrice)) *
                              100
                          )
                        )
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Ultra-lean server architecture ensures high profit margins even with entry-level pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
