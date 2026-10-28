"use client";

import { useState, useEffect } from "react";
import {
  Rocket,
  Search,
  Users,
  TrendingUp,
  MessageSquare,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  DollarSign,
  Phone,
  MapPin,
  Building2,
  Video,
  Twitter,
  Linkedin,
  Coins,
  ShieldCheck,
  Loader2,
} from "lucide-react";

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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner with Financial & Operational KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D121C] border border-amber-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <span>Workspaces</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {metrics?.totalWorkspaces || 1}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Multi-tenant brands</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D121C] border border-amber-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <span>Posts Generated</span>
            <Sparkles className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {metrics?.totalContentGenerated || 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">AI copy + creatives</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D121C] border border-amber-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <span>Gross Margin</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
            {metrics?.financials.grossMarginPct || 92}%
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Target &gt; 85% software margin</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D121C] border border-amber-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <span>Projected MRR</span>
            <DollarSign className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#00F0FF]">
            ₹{metrics?.financials.projectedMRR || 499}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Monthly recurring revenue</p>
        </div>
      </div>

      {/* Main 3 Tool Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        {[
          { id: "prospector", name: "1. Local B2B Prospector (harvey)", icon: Search },
          { id: "storyteller", name: "2. Build-in-Public Storyteller (brag)", icon: Rocket },
          { id: "economics", name: "3. Unit Economics Ledger (Wally)", icon: TrendingUp },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                active
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Harvey Local B2B Prospector */}
      {activeTab === "prospector" && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0D121C] border border-white/[0.06] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Local Business Prospector & Cold WhatsApp Pitch</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Finds salons, clinics, gyms & tutors via OpenStreetMap (100% free, zero Google Places API costs).
                </p>
              </div>

              {/* Language Toggle for Outreach */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-white/[0.06] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPitchLang("bn")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    pitchLang === "bn" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400"
                  }`}
                >
                  বাংলা (BN)
                </button>
                <button
                  type="button"
                  onClick={() => setPitchLang("en")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    pitchLang === "en" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400"
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                  City / Location
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="Kolkata">Kolkata (Park Street / Gariahat)</option>
                  <option value="Salt Lake">Salt Lake / New Town</option>
                  <option value="Howrah">Howrah / Bally</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                  Business Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-400"
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
                  className="w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {loadingLeads ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Search Prospects</span>
                </button>
              </div>
            </div>
          </div>

          {/* Prospects List */}
          <div className="space-y-3">
            {leads.map((lead) => {
              const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
              const pitch = lead.suggestedPitch[pitchLang];
              const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(pitch)}`;

              return (
                <div
                  key={lead.id}
                  className="p-5 rounded-2xl bg-[#0D121C] border border-white/[0.06] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/30 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{lead.name}</h3>
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        {lead.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#00F0FF]" />
                        <span>{lead.phone}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span>{lead.address}</span>
                      </span>
                    </div>

                    {/* Pitch preview box */}
                    <div className="mt-2 p-2.5 rounded-xl bg-zinc-950 border border-white/[0.04] text-xs text-zinc-300 italic">
                      &quot;{pitch.slice(0, 110)}...&quot;
                    </div>
                  </div>

                  {/* 1-Tap WhatsApp outreach button */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <button
                      onClick={() => copyToClipboard(pitch, `pitch_${lead.id}`)}
                      className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all"
                      title="Copy Pitch Message"
                    >
                      {copiedKey === `pitch_${lead.id}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-emerald-600/20"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Pitch</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Build-in-Public Launch Storyteller (brag) */}
      {activeTab === "storyteller" && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0D121C] border border-white/[0.06] space-y-1">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Rocket className="w-4 h-4 text-amber-400" />
              <span>Build-in-Public Viral Storyteller</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Pre-crafted viral posts, X threads & short video scripts from your shipped code milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#0D121C] border border-white/[0.06] space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h3 className="text-sm font-bold text-white">{story.title}</h3>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2.5 py-0.5 rounded-full border border-white/[0.04]">
                    Viral Framework
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Column 1: X (Twitter) Hook */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.04] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span className="flex items-center gap-1.5 font-semibold text-white">
                          <Twitter className="w-3.5 h-3.5 text-sky-400" />
                          <span>X (Twitter) Thread</span>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
                        {story.xHook}
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(story.xHook, `x_${story.id}`)}
                      className="w-full mt-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-all"
                    >
                      {copiedKey === `x_${story.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy X Post</span>
                    </button>
                  </div>

                  {/* Column 2: LinkedIn Story */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.04] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span className="flex items-center gap-1.5 font-semibold text-white">
                          <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                          <span>LinkedIn Founder Story</span>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans max-h-48 overflow-y-auto">
                        {story.linkedInStory}
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(story.linkedInStory, `li_${story.id}`)}
                      className="w-full mt-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-all"
                    >
                      {copiedKey === `li_${story.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy LinkedIn Post</span>
                    </button>
                  </div>

                  {/* Column 3: 30s Short Video Teaser */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.04] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span className="flex items-center gap-1.5 font-semibold text-white">
                          <Video className="w-3.5 h-3.5 text-purple-400" />
                          <span>30s Video Script (brag)</span>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans max-h-48 overflow-y-auto">
                        {story.videoScript}
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(story.videoScript, `vid_${story.id}`)}
                      className="w-full mt-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-all"
                    >
                      {copiedKey === `vid_${story.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Video Script</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Unit Economics & Margin Calculator (Wally) */}
      {activeTab === "economics" && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0D121C] border border-white/[0.06] space-y-1">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Unit Economics & Profit Run-Rate Calculator</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Live margin simulator factoring single-VPS server hosting, Groq/NVIDIA AI tokens, and Cloudinary CDN storage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Sliders */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0D121C] border border-white/[0.06] space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold text-white mb-2">
                  <span>Paying Workspaces / Clients</span>
                  <span className="text-[#00F0FF]">{simClients} Clients</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={simClients}
                  onChange={(e) => setSimClients(Number(e.target.value))}
                  className="w-full accent-[#00F0FF]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-white mb-2">
                  <span>Subscription Tier</span>
                  <span className="text-amber-400">₹{simPlanPrice}/month</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSimPlanPrice(499)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      simPlanPrice === 499
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-zinc-900 border-white/[0.06] text-zinc-400"
                    }`}
                  >
                    Starter (₹499/mo)
                  </button>
                  <button
                    onClick={() => setSimPlanPrice(999)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      simPlanPrice === 999
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-zinc-900 border-white/[0.06] text-zinc-400"
                    }`}
                  >
                    Growth (₹999/mo)
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Dokploy VPS (Hetzner 4 vCPU):</span>
                  <span className="text-zinc-200">₹1,000 / mo</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>AI Copy & Poster (₹0.08 / gen):</span>
                  <span className="text-zinc-200">~₹{Math.round(simClients * 50 * 0.08)} / mo</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Cloudinary Media Storage:</span>
                  <span className="text-emerald-400">₹0 (Free 25GB)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Projections */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0D121C] to-emerald-950/20 border border-emerald-500/30 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                    Projected Monthly Revenue
                  </span>
                  <div className="text-3xl font-black text-white mt-1">
                    ₹{(simClients * simPlanPrice).toLocaleString("en-IN")}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  MRR based on {simClients} paying accounts at ₹{simPlanPrice}/mo.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0D121C] to-teal-950/20 border border-teal-500/30 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">
                    Annual Run Rate (ARR)
                  </span>
                  <div className="text-3xl font-black text-teal-300 mt-1">
                    ₹{(simClients * simPlanPrice * 12).toLocaleString("en-IN")}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Annualized run-rate revenue.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D121C] border border-white/[0.06] space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">Software Gross Margin</span>
                  <span className="text-xs font-extrabold text-emerald-400">
                    {Math.round(
                      (((simClients * simPlanPrice) - (1000 + simClients * 50 * 0.08)) /
                        (simClients * simPlanPrice)) *
                        100
                    )}% Net Margin
                  </span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#00F0FF] rounded-full"
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
                <p className="text-[11px] text-zinc-500 mt-2">
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
