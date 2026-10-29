"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useToast, CustomModal, CustomAlert } from "@/components/ui/ToastProvider";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";

interface Lead {
  id: string;
  name: string;
  phone: string;
  service: string;
  campaign: string;
  status: "NEW" | "IN_PROGRESS" | "CONVERTED";
  receivedAt: string;
  notes?: string;
}

const INITIAL_LEADS: Lead[] = [
  {
    id: "lead_1",
    name: "Ananya Mukherjee",
    phone: "+91 98301 23456",
    service: "Durga Puja Hair Spa & Color Combo",
    campaign: "Durga Puja 50% Off Hair Spa (Instagram)",
    status: "NEW",
    receivedAt: "Today, 10:14 AM IST",
    notes: "Asked about Saturday morning slot for 2 people.",
  },
  {
    id: "lead_2",
    name: "Sourav Ganguly",
    phone: "+91 98312 98765",
    service: "Weekend Grooming Package",
    campaign: "Weekend Grooming Flash Sale (Facebook)",
    status: "IN_PROGRESS",
    receivedAt: "Yesterday, 4:30 PM IST",
    notes: "Inquired about beard styling and facial pricing.",
  },
  {
    id: "lead_3",
    name: "Pooja Sen",
    phone: "+91 98745 11223",
    service: "Bridal Consultation",
    campaign: "Festive Early Bird (Instagram Reel)",
    status: "CONVERTED",
    receivedAt: "26 Oct, 2:15 PM IST",
    notes: "Advance ₹2,000 paid via UPI. Booking confirmed.",
  },
  {
    id: "lead_4",
    name: "Debashis Roy",
    phone: "+91 90510 55443",
    service: "Keratin Treatment Consultation",
    campaign: "Durga Puja 50% Off Hair Spa",
    status: "NEW",
    receivedAt: "27 Oct, 6:45 PM IST",
    notes: "Requested price quote for shoulder length hair.",
  },
];

export default function WhatsAppLeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Lead Form State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newService, setNewService] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const filteredLeads = leads.filter((lead) => {
    const matchesFilter = statusFilter === "ALL" || lead.status === statusFilter;
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) {
      toast.warning("Validation Error", "Please provide a customer name and phone number.");
      return;
    }

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      name: newName,
      phone: newPhone,
      service: newService || "General Inbound Inquiry",
      campaign: "Manual Walk-in / Direct WhatsApp",
      status: "NEW",
      receivedAt: "Just now",
      notes: newNotes,
    };

    setLeads([newLead, ...leads]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewPhone("");
    setNewService("");
    setNewNotes("");

    toast.success("Lead Added Successfully", `Created WhatsApp lead record for ${newName}.`);
  };

  const handleExportCSV = () => {
    const headers = "ID,Name,Phone,Service,Campaign,Status,ReceivedAt,Notes\n";
    const rows = leads
      .map(
        (l) =>
          `"${l.id}","${l.name}","${l.phone}","${l.service}","${l.campaign}","${l.status}","${l.receivedAt}","${l.notes || ""}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `whatsapp_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export Complete", "WhatsApp leads downloaded to CSV successfully.");
  };

  const handleOpenWhatsApp = (lead: Lead) => {
    const cleanNumber = lead.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Namaste ${lead.name}! Thank you for your inquiry regarding "${lead.service}". How can we assist you today?`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
    toast.info("Opening WhatsApp", `Connecting directly with ${lead.name}`);
  };

  const handleStatusChange = (leadId: string, newStatus: Lead["status"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    toast.success("Lead Updated", `Status changed to ${newStatus}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <PageBreadcrumb pageTitle="WhatsApp Leads" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>WhatsApp Inbound Leads</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Inbound
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Real-time customer inquiries captured from your Facebook & Instagram AI promo campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-zinc-200 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inbound Lead</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>Total Inquiries</span>
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-zinc-100">{leads.length}</div>
          <p className="text-[11px] text-zinc-400 mt-1">From automated social promos</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>New Today</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-zinc-100">
            {leads.filter((l) => l.status === "NEW").length}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Requires immediate follow-up</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>Conversion Rate</span>
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-zinc-100">
            {Math.round(
              (leads.filter((l) => l.status === "CONVERTED").length / Math.max(1, leads.length)) * 100
            )}
            %
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Inquiry to customer booked</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>Pipeline Value</span>
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#00F0FF]">₹28,500</div>
          <p className="text-[11px] text-zinc-400 mt-1">Estimated service booking</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, phone, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-none focus:border-[#00F0FF]/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "NEW", "IN_PROGRESS", "CONVERTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                statusFilter === st
                  ? "bg-[#00F0FF] text-[#0A0D14] font-semibold"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/[0.04]"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-white/[0.06] text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Customer & Phone</th>
                <th className="px-5 py-3.5">Inquired Service</th>
                <th className="px-5 py-3.5">Campaign Origin</th>
                <th className="px-5 py-3.5">Received</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-zinc-100">{lead.name}</div>
                      <div className="text-zinc-400 text-[11px] font-mono mt-0.5">{lead.phone}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-zinc-200 font-medium">{lead.service}</div>
                      {lead.notes && (
                        <div className="text-zinc-400 text-[11px] mt-0.5 max-w-xs truncate">
                          "{lead.notes}"
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-zinc-400 text-[11px]">
                      {lead.campaign}
                    </td>

                    <td className="px-5 py-4 text-zinc-400 text-[11px] whitespace-nowrap">
                      {lead.receivedAt}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-full border bg-transparent focus:outline-none cursor-pointer ${
                          lead.status === "CONVERTED"
                            ? "text-purple-400 border-purple-500/30 bg-purple-500/10"
                            : lead.status === "IN_PROGRESS"
                            ? "text-sky-400 border-sky-500/30 bg-sky-500/10"
                            : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                        }`}
                      >
                        <option value="NEW" className="bg-[#111722] text-emerald-400">NEW</option>
                        <option value="IN_PROGRESS" className="bg-[#111722] text-sky-400">IN PROGRESS</option>
                        <option value="CONVERTED" className="bg-[#111722] text-purple-400">CONVERTED</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleOpenWhatsApp(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-all active:scale-95"
                      >
                        <Send className="w-3 h-3" />
                        <span>Chat on WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Popup Modal */}
      <CustomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Inbound WhatsApp Lead"
        description="Record a new walk-in customer or direct phone inquiry into your marketing CRM."
      >
        <form onSubmit={handleAddLead} className="space-y-3.5 mt-2">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Customer Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sen"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-none focus:border-[#00F0FF]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">WhatsApp / Phone Number</label>
            <input
              type="text"
              required
              placeholder="e.g. +91 98300 12345"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-none focus:border-[#00F0FF]/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Inquired Service</label>
            <input
              type="text"
              placeholder="e.g. Hair Spa, Keratin, Facial"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-none focus:border-[#00F0FF]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Customer Notes / Request</label>
            <textarea
              rows={2}
              placeholder="Notes from customer inquiry..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-none focus:border-[#00F0FF]/50"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              Save Lead Record
            </button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
}
