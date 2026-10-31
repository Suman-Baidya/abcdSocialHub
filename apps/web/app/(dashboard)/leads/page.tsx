"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  Phone,
  Calendar,
  Sparkles,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  Send,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  TrendingUp,
  Tag,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useToast, CustomModal } from "@/components/ui/ToastProvider";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  service: string;
  campaign: string;
  status: "NEW" | "IN_PROGRESS" | "CONVERTED";
  receivedAt: string;
  notes?: string;
  estimatedValue?: number;
}

interface LeadsPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

interface LeadsStats {
  totalCount: number;
  newCount: number;
  inProgressCount: number;
  convertedCount: number;
  conversionRate: number;
  estimatedPipelineValue: number;
}

export default function WhatsAppLeadsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();

  // Role and Permission Resolution
  const user = session?.user as any;
  const role = user?.role;
  const allowedPages: string[] = user?.allowedPages || [];

  const isRestricted =
    role === "CREATOR" ||
    role === "GUEST" ||
    ((role === "ADMIN_STAFF" || role === "STAFF") && allowedPages.length > 0 && !allowedPages.includes("leads"));

  // Data & State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Pagination & Metrics from API
  const [pagination, setPagination] = useState<LeadsPagination>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  });

  const [stats, setStats] = useState<LeadsStats>({
    totalCount: 0,
    newCount: 0,
    inProgressCount: 0,
    convertedCount: 0,
    conversionRate: 0,
    estimatedPipelineValue: 48500,
  });

  // Modal State for New Inbound Lead
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newService, setNewService] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newEstimatedValue, setNewEstimatedValue] = useState<number>(1500);

  // Copied phone indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch leads from API
  const fetchLeads = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(pageSize),
          status: statusFilter,
          search: searchQuery.trim(),
        });

        const res = await fetch(`/api/leads?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Failed to load customer inquiries");
        }

        const data = await res.json();
        setLeads(data.items || []);
        if (data.pagination) setPagination(data.pagination);
        if (data.stats) setStats(data.stats);
      } catch (err: any) {
        console.error("fetchLeads error:", err);
        setError(err.message || "Failed to fetch leads");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, pageSize, statusFilter, searchQuery]
  );

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle Search Input Change (debounces to page 1)
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Handle Status Filter Change
  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  // Copy Phone Number with visual feedback
  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    toast.info("Copied to Clipboard", phone);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Update Lead Status via API
  const handleStatusChange = async (leadId: string, newStatus: Lead["status"]) => {
    // Optimistic Update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to persist lead status");
      }

      toast.success("Lead Status Updated", `Status changed to ${newStatus.replace("_", " ")}`);
      fetchLeads(true);
    } catch (err: any) {
      toast.error("Update Failed", err.message);
      fetchLeads();
    }
  };

  // Add Inbound Lead Form Submission
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      toast.warning("Validation Error", "Customer name and phone are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          service: newService.trim() || "General Consultation",
          notes: newNotes.trim(),
          estimatedValue: Number(newEstimatedValue) || 1500,
          status: "NEW",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create lead");
      }

      setIsAddModalOpen(false);
      setNewName("");
      setNewPhone("");
      setNewService("");
      setNewNotes("");
      setNewEstimatedValue(1500);

      toast.success("Inbound Lead Added", `Created inquiry record for ${newName}.`);
      fetchLeads(true);
    } catch (err: any) {
      toast.error("Failed to Add Lead", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Direct WhatsApp Chat
  const handleOpenWhatsApp = (lead: Lead) => {
    const cleanNumber = lead.phone.replace(/\D/g, "");
    const greeting = encodeURIComponent(
      `Namaste ${lead.name}! Thank you for connecting with us regarding "${lead.service}". How may we assist with your booking today?`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${greeting}`, "_blank");
    toast.info("WhatsApp Chat Launched", `Opening WhatsApp session with ${lead.name}`);
  };

  // Export Leads to CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.warning("Export Warning", "No leads available to export.");
      return;
    }

    const headers = "ID,Customer Name,Phone,Service,Campaign,Status,Received,Notes,Estimated Value (INR)\n";
    const rows = leads
      .map(
        (l) =>
          `"${l.id}","${l.name}","${l.phone}","${l.service}","${l.campaign}","${l.status}","${l.receivedAt}","${l.notes || ""}","${l.estimatedValue || 1500}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `whatsapp_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Export Ready", "WhatsApp leads downloaded successfully.");
  };

  // Calculate items display range
  const startItem = pagination.totalItems > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.totalItems);

  // ─────────────────────────────────────────────────────────────
  // 0. Permission Denied State (Creators, Guests, Restricted Staff)
  // ─────────────────────────────────────────────────────────────
  if (isRestricted) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl border border-rose-500/20 bg-card text-card-foreground text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your role ({role ? role.replace("_", " ") : "Member"}) does not have authorization to access WhatsApp Inbound Leads CRM.
          Please contact your workspace Owner or Admin for changes.
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 1. Loading Skeleton State
  // ─────────────────────────────────────────────────────────────
  if (loading && leads.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-5 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-card border border-border p-4" />
          ))}
        </div>
        <div className="h-14 rounded-xl bg-card border border-border" />
        <div className="h-80 rounded-xl bg-card border border-border" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────────
          1. Enterprise Header (Strictly 2 Words Title, 8 Words Desc)
         ───────────────────────────────────────────────────────────── */}
      <PageBreadcrumb
        pageTitle="WhatsApp Leads"
        description="Track and convert customer inquiries from social campaigns."
        hideBreadcrumb={true}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </PageBreadcrumb>

      {/* ─────────────────────────────────────────────────────────────
          2. Error State with Retry
         ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchLeads()}
            className="text-xs font-semibold underline hover:opacity-80 cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. KPI Summary Metric Grid (Number Highlighted First)
             2 boxes per row on mobile = 2 rows, 2 cols = 4 boxes
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
        {/* KPI 1: Total Captured Inquiries */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Inquiries
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {stats.totalCount}
            </h4>
            <span className="text-[11px] font-semibold text-emerald-500">
              Captured
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            Social posters & WhatsApp QR
          </span>
        </div>

        {/* KPI 2: New Inquiries Today */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              New Inquiries
            </span>
            <div className="w-6 h-6 rounded-md bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-500">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-sky-500 tracking-tight">
              {stats.newCount}
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Needs Follow-up
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            Awaiting initial response
          </span>
        </div>

        {/* KPI 3: Conversion Rate */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Conversion Rate
            </span>
            <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-500">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {stats.conversionRate}%
            </h4>
            <span className="text-[11px] font-semibold text-purple-500">
              Booked
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            Inquiry to paid customer
          </span>
        </div>

        {/* KPI 4: Estimated Pipeline Revenue */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Pipeline Value
            </span>
            <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              ₹{(stats.estimatedPipelineValue || 48500).toLocaleString("en-IN")}
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Gross IST
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            Active service appointments
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Performance Search & Filter Controls (Desktop: 1 Line, Mobile: 2 Lines)
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-full overflow-hidden p-2.5 sm:p-3 rounded-2xl bg-card border border-border shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {/* Mobile Line 1 / Desktop Left: Search input + Mobile Refresh */}
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
          <div className="relative flex-1 lg:flex-none lg:w-60 xl:w-72 min-w-0">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 sm:py-2 rounded-xl bg-muted/60 border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Refresh button visible on mobile line 1 */}
          <button
            type="button"
            onClick={() => fetchLeads(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all cursor-pointer shrink-0 shadow-sm lg:hidden"
            title="Refresh leads list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>

        {/* Mobile Line 2 / Desktop Right: Status Pills + Rows Selector + Desktop Refresh */}
        <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto min-w-0">
          {/* Status filter pills in horizontal scroll row */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0 lg:flex-none">
            {[
              { id: "ALL", label: "All", count: stats.totalCount },
              { id: "NEW", label: "New", count: stats.newCount },
              { id: "IN_PROGRESS", label: "In Progress", count: stats.inProgressCount },
              { id: "CONVERTED", label: "Converted", count: stats.convertedCount },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleFilterChange(st.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === st.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    statusFilter === st.id ? "bg-black/20 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Page Size Rows Selector */}
          <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground pl-1">
            <span className="text-[11px] font-semibold hidden md:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Refresh button on desktop right */}
          <button
            type="button"
            onClick={() => fetchLeads(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all cursor-pointer shrink-0 shadow-sm hidden lg:flex"
            title="Refresh leads list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. CRM Leads Data Table with SL # and Combined Campaign Column
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[880px]">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="w-12 px-3 py-3.5 text-center">#</th>
                <th className="min-w-[170px] sm:min-w-[190px] px-3 sm:px-4 py-3.5">Customer & Phone</th>
                <th className="min-w-[240px] sm:min-w-[280px] px-3 sm:px-4 py-3.5">Inquired Service</th>
                <th className="min-w-[200px] sm:min-w-[220px] px-3 sm:px-4 py-3.5">Campaign & Received</th>
                <th className="w-32 px-3 py-3.5">Status</th>
                <th className="w-36 px-3 sm:px-4 py-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        No customer leads found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {searchQuery
                          ? "Try adjusting your search query or filter."
                          : "Leads captured from social promotions and WhatsApp QR codes will appear here."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Inbound Lead</span>
                    </button>
                  </td>
                </tr>
              ) : (
                leads.map((lead, idx) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    {/* SL Number */}
                    <td className="w-12 px-3 py-3.5 text-center font-mono text-[11px] font-bold text-muted-foreground">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>

                    {/* Customer & Phone (Structured so phone never breaks across lines) */}
                    <td className="min-w-[170px] sm:min-w-[190px] px-3 sm:px-4 py-3.5">
                      <div className="font-bold text-foreground text-xs sm:text-sm whitespace-nowrap">
                        {lead.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                        <span className="text-muted-foreground text-[11px] font-mono whitespace-nowrap">
                          {lead.phone}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(lead.id, lead.phone)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 shrink-0"
                          title="Copy phone"
                        >
                          {copiedId === lead.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Inquired Service & Customer Notes (Structured on 2 clean lines, never vertically squished) */}
                    <td className="min-w-[240px] sm:min-w-[280px] px-3 sm:px-4 py-3.5">
                      <div className="text-foreground font-bold text-xs leading-snug whitespace-nowrap">
                        {lead.service}
                      </div>
                      {lead.notes && (
                        <div
                          className="text-muted-foreground text-[11px] mt-0.5 leading-snug truncate max-w-[260px] italic"
                          title={lead.notes}
                        >
                          "{lead.notes}"
                        </div>
                      )}
                    </td>

                    {/* Combined: Campaign Origin + Received Date */}
                    <td className="min-w-[200px] sm:min-w-[220px] px-3 sm:px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border text-[10px] font-medium block truncate max-w-[210px]">
                        {lead.campaign}
                      </span>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 whitespace-nowrap">
                        <Clock className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                        <span>{lead.receivedAt}</span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="w-32 px-3 py-3.5">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border bg-card focus:outline-none cursor-pointer transition-colors ${
                          lead.status === "CONVERTED"
                            ? "text-purple-500 border-purple-500/30 bg-purple-500/10"
                            : lead.status === "IN_PROGRESS"
                            ? "text-sky-500 border-sky-500/30 bg-sky-500/10"
                            : "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                        }`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="CONVERTED">CONVERTED</option>
                      </select>
                    </td>

                    {/* Action: 1-Tap WhatsApp Direct */}
                    <td className="w-36 px-3 sm:px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3 h-3 text-emerald-500" />
                        <span>Chat WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            6. Strict 1-Line Responsive Pagination Bar
           ───────────────────────────────────────────────────────────── */}
        <div className="p-3 sm:p-3.5 border-t border-border bg-card flex items-center justify-between text-xs text-muted-foreground gap-2">
          {/* Left: Range text */}
          <span className="text-[11px] sm:text-xs">
            Showing <strong className="text-foreground">{startItem}</strong> to{" "}
            <strong className="text-foreground">{endItem}</strong> of{" "}
            <strong className="text-foreground">{pagination.totalItems}</strong> leads
          </span>

          {/* Right: Navigation Controls in a single line */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!pagination.hasPrev}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page number indicators */}
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .slice(0, 5)
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "border border-border bg-card hover:bg-muted text-foreground"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
            </div>

            <button
              type="button"
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. Add Inbound Lead Modal (Full-Screen Portal'd with CustomModal)
         ───────────────────────────────────────────────────────────── */}
      <CustomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Lead"
        description="Record new customer or direct inquiry into CRM."
      >
        <form onSubmit={handleAddLead} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Customer Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sen"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              WhatsApp / Phone Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. +91 98300 12345"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Inquired Service / Package
            </label>
            <input
              type="text"
              placeholder="e.g. Hair Spa, Keratin, Facial"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Customer Notes / Scheduling Request
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Inquired about weekend slot for 2 people..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Estimated Booking Value (₹ INR)
            </label>
            <input
              type="number"
              placeholder="1500"
              value={newEstimatedValue}
              onChange={(e) => setNewEstimatedValue(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Lead Record</span>
              )}
            </button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
}
