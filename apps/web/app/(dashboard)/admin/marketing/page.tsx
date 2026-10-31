"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Rocket,
  Search,
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
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sliders,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { StatCard, LoadingSkeleton, EmptyState } from "@/components/common";
import { useToast } from "@/components/ui/ToastProvider";

interface Lead {
  id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  address: string;
  rating: string;
  status: "NEW" | "PITCHED" | "CONVERTED";
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"prospector" | "storyteller" | "economics">("prospector");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Harvey Prospector Filters & State
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "NEW" | "PITCHED" | "CONVERTED">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [pitchLang, setPitchLang] = useState<"bn" | "en">("bn");
  const [expandedPitchId, setExpandedPitchId] = useState<string | null>(null);
  const PAGE_LIMIT = 10; // Exactly 10 rows per pagination

  // Metrics State
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Interactive Economics Calculator
  const [simClients, setSimClients] = useState(25);
  const [simPlanPrice, setSimPlanPrice] = useState(499);
  const [simPostsPerClient, setSimPostsPerClient] = useState(30);

  // Storyteller Milestone Hook Generator State
  const [storyCategoryFilter, setStoryCategoryFilter] = useState("all");
  const [customMilestone, setCustomMilestone] = useState("");
  const [generatedHook, setGeneratedHook] = useState<{
    xHook: string;
    linkedIn: string;
    video: string;
  } | null>(null);

  // Fetch leads with server pagination and filtering
  const fetchLeads = useCallback(async (page = 1) => {
    setLoadingLeads(true);
    try {
      const params = new URLSearchParams({
        city,
        category,
        status: statusFilter,
        search: searchQuery,
        page: String(page),
        limit: String(PAGE_LIMIT),
      });

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setTotalLeads(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
      toast.error("Failed to load leads", "Please check your network connection.");
    } finally {
      setLoadingLeads(false);
    }
  }, [city, category, statusFilter, searchQuery, toast]);

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
    fetchLeads(1);
  }, [fetchLeads]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const copyToClipboard = (text: string, key: string, label = "Pitch message") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard", `${label} is ready to paste.`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLaunchWhatsApp = (lead: Lead, pitch: string) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(pitch)}`;

    // Mark lead status as PITCHED locally for immediate responsiveness
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: "PITCHED" } : l))
    );

    window.open(waUrl, "_blank", "noopener,noreferrer");
    toast.success("WhatsApp Pitch Launched", `Pitched ${lead.name}. Status updated to Pitched.`);
  };

  // Build-in-Public Storyteller Templates
  const stories = useMemo(() => [
    {
      id: "story_1",
      title: "Why Indian Local Business Owners Will Never Log In",
      category: "Product Strategy",
      xHook: `Most SaaS builders make the fatal mistake of building complex desktop dashboards for local business owners.\n\nHere's the reality: Salons, clinics & gyms don't have laptops behind the desk. They live 100% on WhatsApp.\n\nThat's why at ABCD Social, our primary UI is a 1-tap mobile magic-link. Zero password. 5-second review.`,
      linkedInStory: `Building for India's 60M+ local service businesses taught me one brutal lesson:\n\nIf your software requires opening a laptop, logging in, or tweaking design sliders — the owner will churn in 14 days.\n\nLocal salon and clinic owners aren't lazy; they are on their feet serving customers 12 hours a day. They don't have time for Canva or complex dashboards.\n\nWe engineered ABCD Social around a simple premise:\n1. The AI drafts the 1080×1080 Bengali/English poster automatically.\n2. The owner receives a WhatsApp magic link.\n3. They tap "Approve" with one thumb in 5 seconds.\n\nMeet your users where they actually work. For India, that's WhatsApp.`,
      videoScript: `Hook (0-3s): "Here is why 90% of marketing tools fail in India..."\nProblem (3-10s): Show busy salon in Kolkata with hair stylists on their feet all day.\nSolution (10-22s): Show phone receiving WhatsApp notification with 1-tap Approve button.\nCall to Action (22-30s): "Tap Approve. Done. AI publishes to Instagram & Facebook instantly."`,
    },
    {
      id: "story_2",
      title: "The Zero-Cost Bengali AI Poster Engine",
      category: "Engineering Architecture",
      xHook: `Canva cannot render Bengali ligatures (যুক্তাক্ষর) reliably without broken glyphs.\n\nWe built a custom Pillow + GNU Cairo rendering engine with Noto Sans Bengali running on a $12 VPS.\n\nResult: 1080×1080 localized posters rendered and uploaded to Cloudinary CDN in < 450ms. Zero cloud GPUs needed.`,
      linkedInStory: `Why regional language marketing is the biggest untapped frontier in Indian SaaS:\n\nEnglish marketing copy has 5-8% engagement in Tier 2/3 cities. Conversational Bengali copy has 34%+ engagement.\n\nYet, almost every poster generation tool clips Bengali matras and breaks conjunct consonants.\n\nWe solved this with a dedicated microservice isolating Indic font shaping using Noto Sans Bengali and GNU Cairo.\n\nTotal cloud cost per generated poster? ₹0.08. Margin? 92%.\n\nHyper-localization always wins.`,
      videoScript: `Hook (0-3s): "Why did we build our own regional poster engine?"\nProblem (3-10s): Screen showing broken Bengali text in generic canvas tools.\nSolution (10-22s): "1080×1080 crisp promotional creative with logo, phone number, and address burned automatically."\nCall to Action (22-30s): "Real local reach for regional businesses. Check out ABCD Social."`,
    },
    {
      id: "story_3",
      title: "Bootstrapping an AI Agency SaaS on a $12 Hetzner Server",
      category: "Unit Economics",
      xHook: `Our SaaS has 92% gross software margins from day one.\n\nHow?\n- PostgreSQL + pg-boss queue on single NVMe VPS\n- Next.js 14 App Router with zero cold starts\n- Gemini 1.5 Flash for Bengali marketing copy (₹0.02 / run)\n\nNever over-engineer cloud infrastructure before revenue.`,
      linkedInStory: `The biggest lie sold to early-stage founders is that you need Kubernetes, microservices, and multi-region AWS clusters before you have your first 100 paying customers.\n\nWe run ABCD Social on a single ₹1,000/month Hetzner VPS:\n- Next.js App Router frontend\n- FastAPI Python worker for Cairo Indic typography\n- PostgreSQL 16 database with tenant-scoped isolation\n- pg-boss background worker for autonomous Instagram & Meta publishing\n\nTotal monthly server overhead: ₹1,000.\nBreak-even threshold: Exactly 3 paying customers at ₹499/mo.\n\nKeep overhead near zero so you can stay in the game until you win.`,
      videoScript: `Hook (0-3s): "How much does it cost to run our AI SaaS?"\nProblem (3-10s): Terminal screen showing htop with 8% CPU usage.\nSolution (10-22s): "₹1,000 VPS. 50+ business clients. 92% profit margin."\nCall to Action (22-30s): "Build lean. Charge real money."`,
    },
    {
      id: "story_4",
      title: "Why Shadow Impersonation is Essential for B2B SaaS Support",
      category: "Product Strategy",
      xHook: `If a local business owner calls you because their Instagram token expired, asking them to send error screenshots is suicide.\n\nWe built Stealth Shadow Developer Mode into ABCD Social.\n\n1-click inspect any user's exact workspace. Fix their problem in 10 seconds. Zero disruption.`,
      linkedInStory: `Customer support in SMB SaaS is make-or-break.\n\nWhen a non-technical salon owner runs into an issue, they don't submit Zendesk tickets or explain API errors. They simply stop using the tool.\n\nWe engineered Stealth Shadow Developer Diagnostics directly into ABCD Social:\n1. Super Admin selects any enrolled customer from the cockpit.\n2. Instantly switches session context to that user's exact brand kit and scheduled queue.\n3. Diagnoses and repairs the issue directly without alerting the customer.\n\nHigh-touch service delivered with zero friction.`,
      videoScript: `Hook (0-3s): "How do you handle customer bugs with zero churn?"\nProblem (3-10s): Customer calls asking why a scheduled post didn't publish.\nSolution (10-22s): "Developer 1-click shadow inspects their exact dashboard and fixes the token in 10 seconds."\nCall to Action (22-30s): "Support that feels like magic."`,
    },
  ], []);

  // Filtered stories
  const filteredStories = useMemo(() => {
    if (storyCategoryFilter === "all") return stories;
    return stories.filter((s) => s.category.toLowerCase().includes(storyCategoryFilter.toLowerCase()));
  }, [stories, storyCategoryFilter]);

  // Handle custom milestone generation
  const handleGenerateCustomMilestone = () => {
    if (!customMilestone.trim()) return;
    const milestoneText = customMilestone.trim();
    setGeneratedHook({
      xHook: `Just shipped for @abcdsocial: ${milestoneText}.\n\nBuilt for Indian business owners who need results without complexity.\n\nZero bloat. 100% focused on local ROI.`,
      linkedIn: `Milestone reached: ${milestoneText}.\n\nWhen building software for local businesses, shipping speed and radical simplicity are everything.\n\nToday we deployed an update that directly streamlines marketing for salons, clinics, and local brands across West Bengal.\n\nAlways listening to real customer feedback. Onward!`,
      video: `Hook (0-3s): "We just shipped something big for local businesses..."\nProblem (3-10s): Explain what was broken or slow before.\nSolution (10-22s): "Now: ${milestoneText} in 1 tap."\nCall to Action (22-30s): "Try it today on ABCD Social."`,
    });
    toast.success("Viral Hooks Generated", "Custom milestone hooks are ready below.");
  };

  // Dynamic Economics Calculations
  const monthlyRevenue = simClients * simPlanPrice;
  const annualRunRate = monthlyRevenue * 12;
  const vpsCost = 1000; // Hetzner fixed
  const aiCost = Math.round(simClients * simPostsPerClient * 0.08); // ₹0.08 per post (Gemini + Cairo)
  const cdnCost = 0; // Free 25GB tier
  const paymentGatewayFee = Math.round(monthlyRevenue * 0.0236); // Razorpay 2% + 18% GST = 2.36%
  const totalCogs = vpsCost + aiCost + cdnCost + paymentGatewayFee;
  const netProfit = Math.max(0, monthlyRevenue - totalCogs);
  const netMarginPct = monthlyRevenue > 0 ? Math.round((netProfit / monthlyRevenue) * 100) : 0;
  const breakEvenClients = Math.ceil(vpsCost / (simPlanPrice - (simPostsPerClient * 0.08 + simPlanPrice * 0.0236)));
  const customerLTV = simPlanPrice * 6; // 6-month average retention

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────────
          1. Canonical Page Breadcrumb Header (2-3 Words Title, 7-8 Words Desc)
         ───────────────────────────────────────────────────────────── */}
      <PageBreadcrumb
        pageTitle="Founder Cockpit"
        description="Executive growth engine, local prospecting, unit economics."
        hideBreadcrumb={true}
      >
        <div className="flex items-center gap-2">
          <Link
            href="/admin/tenants"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Manage Tenants</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              fetchLeads(currentPage);
              fetchMetrics();
              toast.info("Refreshed", "Metrics and prospects reloaded.");
            }}
            disabled={loadingMetrics || loadingLeads}
            className="p-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Refresh metrics and leads"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics || loadingLeads ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
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
          badge={{ text: "Active Tenants", variant: "neutral" }}
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
          3. Main Navigation Tabs (Semantic Design Tokens, No Scrollbars)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-nowrap">
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
                  ? "bg-primary/10 text-primary border border-primary/25 shadow-xs"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full border font-mono ${
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
          TAB 1: Local B2B Prospector with Single-Line Top Toolbar & Serial Numbers
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "prospector" && (
        <div className="space-y-3">
          {/* Top Toolbar: Strictly ONE Single Line on Both Desktop & Mobile (No Title) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-nowrap p-2 sm:p-2.5 rounded-xl border border-border bg-card shadow-xs">
            {/* Search Box - Significantly Increased Width */}
            <div className="relative min-w-[280px] sm:min-w-[360px] md:min-w-[420px] flex-1 max-w-lg shrink-0">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 sm:top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lead by name, phone, or address..."
                className="w-full pl-9 sm:pl-10 pr-8 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs placeholder:text-muted-foreground/70"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 sm:top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* City Selector */}
            <div className="min-w-[110px] shrink-0">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs cursor-pointer"
              >
                <option value="all">All Cities</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Salt Lake">Salt Lake</option>
                <option value="Howrah">Howrah</option>
              </select>
            </div>

            {/* Category Selector */}
            <div className="min-w-[130px] shrink-0">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="salon">Hair & Beauty</option>
                <option value="dentist">Dental Clinic</option>
                <option value="gym">Fitness Gym</option>
                <option value="auto">Auto Repair</option>
                <option value="tutor">Tuition Coaching</option>
              </select>
            </div>

            {/* Stage Tabs */}
            <div className="flex items-center gap-1 shrink-0 px-1 border-l border-border pl-2">
              {[
                { id: "all", label: "All" },
                { id: "NEW", label: "Ready" },
                { id: "PITCHED", label: "Pitched" },
                { id: "CONVERTED", label: "Converted" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    statusFilter === st.id
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Language Toggle - Compact & Matches The Other Buttons on This Line */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => setPitchLang("bn")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  pitchLang === "bn"
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setPitchLang("en")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  pitchLang === "en"
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Prospects List & Pagination */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="font-medium text-foreground">
                Showing <strong>{leads.length}</strong> of <strong>{totalLeads}</strong> leads (10 per page)
              </span>
              <span className="text-[11px]">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
            </div>

            {loadingLeads ? (
              <LoadingSkeleton type="cards" count={4} />
            ) : leads.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No leads found"
                description="Try adjusting your city, category, or search filters above."
                actionText="Reset Filters"
                onAction={() => {
                  setCity("all");
                  setCategory("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {leads.map((lead, index) => {
                  const serial = (currentPage - 1) * PAGE_LIMIT + index + 1;
                  const pitch = lead.suggestedPitch[pitchLang];
                  const isPitched = lead.status === "PITCHED";
                  const isConverted = lead.status === "CONVERTED";
                  const isExpanded = expandedPitchId === lead.id;

                  return (
                    <div
                      key={lead.id}
                      className="p-2 sm:p-2.5 rounded-xl border border-border bg-card hover:border-primary/40 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3"
                    >
                      {/* 1. Serial Number Badge & Identity Block (Strictly 2 Lines) */}
                      <div className="flex items-center gap-2.5 min-w-0 w-full md:w-[38%] lg:w-[36%] shrink-0">
                        <span className="w-7 h-7 rounded-lg bg-muted/80 border border-border text-foreground font-mono font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                          #{serial}
                        </span>

                        {/* Identity Details - Strictly 2 Lines */}
                        <div className="min-w-0 flex-1 overflow-hidden">
                          {/* Line 1: Name (with dot-dot ... if large) + Category + Rating + Status Badges */}
                          <div className="flex items-center gap-1.5 flex-nowrap min-w-0 overflow-hidden">
                            <h3
                              className="text-xs sm:text-sm font-bold text-foreground truncate min-w-0 flex-1 max-w-[130px] sm:max-w-[160px] shrink-0"
                              title={lead.name}
                            >
                              {lead.name}
                            </h3>
                            <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded-full capitalize shrink-0">
                              {lead.category}
                            </span>
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded-full border border-border shrink-0">
                              ⭐ {lead.rating}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border shrink-0 ${
                                isConverted
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25"
                                  : isPitched
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                              }`}
                            >
                              {isConverted ? "Customer" : isPitched ? "Pitched" : "Ready"}
                            </span>
                          </div>

                          {/* Line 2: Phone • Address */}
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate mt-0.5 min-w-0 overflow-hidden">
                            <span className="font-mono text-foreground/85 shrink-0">{lead.phone}</span>
                            <span>•</span>
                            <span className="truncate">{lead.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Center: Description / Pitch with dot-dot (...) that expands on click */}
                      <div className="flex-1 min-w-0 px-1">
                        <button
                          type="button"
                          onClick={() => setExpandedPitchId(isExpanded ? null : lead.id)}
                          className="text-left w-full group cursor-pointer"
                          title={isExpanded ? "Click to collapse pitch" : "Click to view full pitch"}
                        >
                          <div
                            className={`p-1.5 sm:p-2 rounded-lg bg-muted/40 hover:bg-muted border border-border/70 text-xs text-muted-foreground transition-all ${
                              isExpanded ? "whitespace-pre-wrap leading-relaxed text-foreground" : "truncate"
                            }`}
                          >
                            <span className="font-serif italic">&ldquo;</span>
                            <span>{isExpanded ? pitch : `${pitch.slice(0, 75)}...`}</span>
                            <span className="font-serif italic">&rdquo;</span>
                            <span className="text-[10px] text-primary ml-1.5 font-medium underline opacity-80 group-hover:opacity-100">
                              {isExpanded ? "(collapse)" : "(show all)"}
                            </span>
                          </div>
                        </button>
                      </div>

                      {/* 3. Actions: Copy & WhatsApp Pitch */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pitch, `pitch_${lead.id}`)}
                          className="p-1.5 sm:p-2 rounded-lg bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Copy Pitch Message"
                        >
                          {copiedKey === `pitch_${lead.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLaunchWhatsApp(lead, pitch)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white font-semibold text-xs transition-all active:scale-95 shadow-xs cursor-pointer whitespace-nowrap ${
                            isPitched
                              ? "bg-emerald-700 hover:bg-emerald-600"
                              : "bg-emerald-600 hover:bg-emerald-500"
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{isPitched ? "Re-Pitch" : "WhatsApp"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls (10 rows per page) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-xs text-xs text-muted-foreground">
                <span className="text-[11px]">
                  Showing {(currentPage - 1) * PAGE_LIMIT + 1}–{Math.min(currentPage * PAGE_LIMIT, totalLeads)} of {totalLeads} leads
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchLeads(currentPage - 1)}
                    disabled={currentPage <= 1 || loadingLeads}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <span className="px-2 text-xs font-semibold text-foreground">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => fetchLeads(currentPage + 1)}
                    disabled={currentPage >= totalPages || loadingLeads}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: Build-in-Public Launch Storyteller (Enhanced Suite)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "storyteller" && (
        <div className="space-y-4">
          {/* Header Card with Custom Milestone Hook Generator */}
          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-primary" />
                  <span>Build-in-Public Viral Storyteller</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  High-converting X threads, LinkedIn founder posts & 30s video scripts from your shipped milestones.
                </p>
              </div>

              {/* Milestone Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-nowrap">
                {["all", "Product Strategy", "Engineering", "Unit Economics"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setStoryCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                      storyCategoryFilter === cat
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {cat === "all" ? "All Stories" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Milestone Hook Generator Form */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Sparkles className="w-3.5 h-3.5 text-primary absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={customMilestone}
                  onChange={(e) => setCustomMilestone(e.target.value)}
                  placeholder="Shipped something new? Type milestone (e.g. 'Added 1-click WhatsApp review page')..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGenerateCustomMilestone();
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleGenerateCustomMilestone}
                disabled={!customMilestone.trim()}
                className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Viral Hook</span>
              </button>
            </div>

            {/* Render Generated Hook Card if available */}
            {generatedHook && (
              <div className="mt-3 p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generated Hook: &ldquo;{customMilestone}&rdquo;</span>
                  </span>
                  <button
                    onClick={() => setGeneratedHook(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-muted-foreground">
                  <div className="p-2.5 rounded-lg bg-card border border-border">
                    <div className="font-bold text-foreground mb-1 flex items-center gap-1">
                      <Twitter className="w-3 h-3 text-sky-500" />
                      <span>X Tweet</span>
                    </div>
                    <p className="whitespace-pre-wrap font-sans text-[11px]">{generatedHook.xHook}</p>
                    <button
                      onClick={() => copyToClipboard(generatedHook.xHook, "gen_x", "Custom X Hook")}
                      className="mt-2 text-[10px] text-primary font-bold hover:underline"
                    >
                      Copy Tweet
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border">
                    <div className="font-bold text-foreground mb-1 flex items-center gap-1">
                      <Linkedin className="w-3 h-3 text-blue-500" />
                      <span>LinkedIn Story</span>
                    </div>
                    <p className="whitespace-pre-wrap font-sans text-[11px]">{generatedHook.linkedIn}</p>
                    <button
                      onClick={() => copyToClipboard(generatedHook.linkedIn, "gen_li", "Custom LinkedIn Story")}
                      className="mt-2 text-[10px] text-primary font-bold hover:underline"
                    >
                      Copy Story
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border">
                    <div className="font-bold text-foreground mb-1 flex items-center gap-1">
                      <Video className="w-3 h-3 text-purple-500" />
                      <span>Video Teleprompter</span>
                    </div>
                    <p className="whitespace-pre-wrap font-sans text-[11px]">{generatedHook.video}</p>
                    <button
                      onClick={() => copyToClipboard(generatedHook.video, "gen_vid", "Custom Video Script")}
                      className="mt-2 text-[10px] text-primary font-bold hover:underline"
                    >
                      Copy Script
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredStories.map((story) => {
              const charCount = story.xHook.length;
              const wordCount = story.linkedInStory.split(/\s+/).length;

              return (
                <div
                  key={story.id}
                  className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-sm font-bold text-foreground">{story.title}</h3>
                    <span className="text-[10px] text-primary font-semibold bg-primary/10 border border-primary/25 px-2.5 py-0.5 rounded-full">
                      {story.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                    {/* Column 1: X (Twitter) Hook with Character Count & Tweet Launcher */}
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1.5 font-semibold text-foreground">
                            <Twitter className="w-3.5 h-3.5 text-sky-500" />
                            <span>X (Twitter) Thread</span>
                          </span>
                          <span
                            className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                              charCount <= 280
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {charCount} / 280
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
                          {story.xHook}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(story.xHook, `x_${story.id}`, "X Post")}
                          className="flex-1 py-1.5 rounded-lg bg-card hover:bg-muted text-xs font-semibold text-foreground border border-border flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                          {copiedKey === `x_${story.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Copy X</span>
                        </button>

                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(story.xHook)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Open in X / Tweet Composer"
                        >
                          <span>Tweet</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Column 2: LinkedIn Story with Word Count & Share Launcher */}
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1.5 font-semibold text-foreground">
                            <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                            <span>LinkedIn Founder Story</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ~{wordCount} words • 1m read
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans max-h-48 overflow-y-auto no-scrollbar pr-1">
                          {story.linkedInStory}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(story.linkedInStory, `li_${story.id}`, "LinkedIn Story")}
                          className="flex-1 py-1.5 rounded-lg bg-card hover:bg-muted text-xs font-semibold text-foreground border border-border flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                          {copiedKey === `li_${story.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Copy LinkedIn</span>
                        </button>

                        <a
                          href="https://www.linkedin.com/feed/"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Open LinkedIn Feed"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Column 3: 30s Short Video Teleprompter Script */}
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1.5 font-semibold text-foreground">
                            <Video className="w-3.5 h-3.5 text-purple-500" />
                            <span>30s Video Teleprompter</span>
                          </span>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.2 rounded">
                            Shorts / Reels
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans max-h-48 overflow-y-auto no-scrollbar pr-1">
                          {story.videoScript}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(story.videoScript, `vid_${story.id}`, "Video Script")}
                          className="w-full py-1.5 rounded-lg bg-card hover:bg-muted text-xs font-semibold text-foreground border border-border flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                          {copiedKey === `vid_${story.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Copy Teleprompter Script</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: Unit Economics Ledger (Advanced Sensitivity & Waterfall)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "economics" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-1">
            <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Unit Economics & Profit Run-Rate Calculator</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Executive margin simulator factoring Hetzner single-VPS hosting, Gemini AI inference tokens, and Razorpay transaction fees.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Interactive Inputs & Client Sensitivity */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  <span>Growth Model Variables</span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Real-time Simulation
                </span>
              </div>

              {/* Paying Clients Slider with Quick Presets */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>Paying Workspaces</span>
                  <span className="text-primary font-bold">{simClients} Clients</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={simClients}
                  onChange={(e) => setSimClients(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />
                {/* Presets */}
                <div className="flex items-center gap-1 justify-between pt-1">
                  {[10, 25, 50, 100, 250].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSimClients(preset)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
                        simClients === preset
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Average Posts Generated per Client */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>Avg Posts / Client / Mo</span>
                  <span className="text-amber-500 font-bold">{simPostsPerClient} Posts</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={simPostsPerClient}
                  onChange={(e) => setSimPostsPerClient(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>

              {/* Subscription Tier Selector */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>Subscription Price</span>
                  <span className="text-emerald-500 font-bold">₹{simPlanPrice}/mo</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Starter", price: 499 },
                    { label: "Growth", price: 999 },
                    { label: "Agency", price: 2499 },
                  ].map((tier) => (
                    <button
                      key={tier.price}
                      type="button"
                      onClick={() => setSimPlanPrice(tier.price)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        simPlanPrice === tier.price
                          ? "bg-primary/10 border-primary text-primary shadow-xs"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div>{tier.label}</div>
                      <div className="text-[10px] font-mono font-normal">₹{tier.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Itemized Cost Breakdown */}
              <div className="pt-3 border-t border-border space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Hetzner 4 vCPU Server:</span>
                  <span className="text-foreground font-medium">₹{vpsCost.toLocaleString("en-IN")} / mo (Fixed)</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>AI Inference ({simClients * simPostsPerClient} runs @ ₹0.08):</span>
                  <span className="text-foreground font-medium">₹{aiCost.toLocaleString("en-IN")} / mo</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Cloudinary Media CDN:</span>
                  <span className="text-emerald-500 font-medium">₹0 (Free 25GB Tier)</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Razorpay Fee (2.36% net):</span>
                  <span className="text-foreground font-medium">₹{paymentGatewayFee.toLocaleString("en-IN")} / mo</span>
                </div>
                <div className="flex justify-between text-foreground font-bold pt-1.5 border-t border-border/80">
                  <span>Total Monthly COGS:</span>
                  <span className="text-rose-500 font-mono">₹{totalCogs.toLocaleString("en-IN")} / mo</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Financial Projections & Waterfall */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              {/* 4 Revenue & Margin Metric Cards (Identical Structure, No Tags) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {[
                  {
                    label: "Monthly MRR",
                    value: `₹${monthlyRevenue.toLocaleString("en-IN")}`,
                  },
                  {
                    label: "Annual ARR",
                    value: `₹${annualRunRate.toLocaleString("en-IN")}`,
                  },
                  {
                    label: "Net Profit",
                    value: `₹${netProfit.toLocaleString("en-IN")}`,
                  },
                  {
                    label: "Gross Margin",
                    value: `${netMarginPct}%`,
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="p-3 sm:p-3.5 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-1.5"
                  >
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                      {card.label}
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Waterfall Margin Visual Distribution Bar */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">Revenue Allocation Waterfall</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {netMarginPct}% Retained as Net Profit
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex shadow-inner">
                  {/* Server Hosting slice */}
                  <div
                    style={{ width: `${Math.min(100, Math.round((vpsCost / monthlyRevenue) * 100))}%` }}
                    className="bg-sky-500 h-full"
                    title={`Server Hosting: ₹${vpsCost}`}
                  />
                  {/* AI & Poster Rendering slice */}
                  <div
                    style={{ width: `${Math.min(100, Math.round((aiCost / monthlyRevenue) * 100))}%` }}
                    className="bg-purple-500 h-full"
                    title={`AI & Poster Rendering: ₹${aiCost}`}
                  />
                  {/* Razorpay slice */}
                  <div
                    style={{ width: `${Math.min(100, Math.round((paymentGatewayFee / monthlyRevenue) * 100))}%` }}
                    className="bg-amber-500 h-full"
                    title={`Razorpay Fees: ₹${paymentGatewayFee}`}
                  />
                  {/* Net Profit slice */}
                  <div
                    style={{ width: `${Math.max(0, netMarginPct)}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Net Profit: ₹${netProfit}`}
                  />
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>VPS ({Math.round((vpsCost / monthlyRevenue) * 100)}%)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>AI Tokens ({Math.round((aiCost / monthlyRevenue) * 100)}%)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Razorpay ({Math.round((paymentGatewayFee / monthlyRevenue) * 100)}%)</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 ml-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Net Profit ({netMarginPct}%)</span>
                  </span>
                </div>
              </div>

              {/* Strategic Insights Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border bg-card shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Break-Even Clients
                  </span>
                  <div className="font-extrabold text-foreground text-sm">
                    {breakEvenClients} Clients
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Only {breakEvenClients} paying accounts needed to cover 100% of cloud server costs.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-card shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Customer LTV
                  </span>
                  <div className="font-extrabold text-foreground text-sm">
                    ₹{customerLTV.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Based on conservative 6-month average retention for local business accounts.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-card shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    CAC Payback Period
                  </span>
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    &lt; 7 Days
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Direct local WhatsApp outreach yields near-zero customer acquisition cost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
