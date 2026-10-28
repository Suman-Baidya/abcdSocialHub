"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
  Send,
  Loader2,
  Calendar,
  Sparkles,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  ChevronDown,
  Building2,
  Phone,
} from "lucide-react";

interface Variant {
  platform: string;
  caption: string;
  mediaUrl?: string | null;
}

interface ApprovalProps {
  token: string;
  contentItem: {
    id: string;
    title: string;
    rawBrief: string;
    status: string;
    scheduledFor: string | null;
    posterUrl: string | null;
    variants: Variant[];
    brand: {
      businessName: string;
      phoneNumber: string;
      address: string;
      primaryColor: string;
    };
  };
}

export function ApprovalClientView({ token, contentItem }: ApprovalProps) {
  const [status, setStatus] = useState<string>(contentItem.status);
  const [activeTab, setActiveTab] = useState<string>("INSTAGRAM_BUSINESS");
  const [submitting, setSubmitting] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);

  const formattedDate = contentItem.scheduledFor
    ? new Date(contentItem.scheduledFor).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " IST"
    : "Tomorrow, 10:00 AM IST";

  const handleDecision = async (decision: "APPROVE" | "REQUEST_CHANGES", notes?: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/approve/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus(data.status);
        setShowNotesModal(false);
      } else {
        alert(data.error || "Failed to process decision. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getActiveCaption = () => {
    const v = contentItem.variants.find((item) => item.platform === activeTab);
    return v?.caption || contentItem.variants[0]?.caption || contentItem.rawBrief;
  };

  // Success State
  if (status === "SCHEDULED" || status === "APPROVED") {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#111722]/90 border border-emerald-500/30 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Approved & Locked
            </span>
            <h1 className="text-xl font-bold text-white mt-3">Post is Scheduled!</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
              Your marketing post for <strong>{contentItem.brand.businessName}</strong> has been approved. The AI Autopilot will publish it at:
            </p>
            <div className="mt-3 p-3 rounded-xl bg-zinc-900/90 border border-white/[0.06] text-xs font-semibold text-[#00F0FF] flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-[#00F0FF]" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 pt-2">
            You can close this window now. WhatsApp notification will be sent when published.
          </p>
        </div>
      </div>
    );
  }

  // Changes Requested State
  if (status === "DRAFT") {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#111722]/90 border border-amber-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Feedback Submitted</h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Your revision notes were sent to the marketing team for <strong>{contentItem.brand.businessName}</strong>. You will receive a new 1-tap review link once revised.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-zinc-100 pb-36">
      {/* Top Mobile App Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00F0FF] text-[#0A0D14] flex items-center justify-center font-black text-xs shadow-md shadow-[#00F0FF]/20">
            {contentItem.brand.businessName[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <div className="text-xs font-bold text-white truncate max-w-[190px]">
              {contentItem.brand.businessName}
            </div>
            <div className="text-[10px] text-zinc-400">1-Tap Owner Review</div>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
          Needs Approval
        </span>
      </header>

      {/* Main Review Body */}
      <main className="max-w-md mx-auto p-4 space-y-5">
        {/* Scheduled Slot Notice */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/[0.06] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
              Target Broadcast Slot
            </div>
            <div className="text-xs font-semibold text-zinc-100">{formattedDate}</div>
          </div>
        </div>

        {/* 1080x1080 Branded Poster Creative */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-zinc-300">Poster Creative (1080×1080)</span>
            <span className="text-[10px] text-[#00F0FF] font-medium">Ready for IG & FB</span>
          </div>

          {contentItem.posterUrl ? (
            <div className="rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl relative aspect-square bg-zinc-950">
              <img
                src={contentItem.posterUrl}
                alt={contentItem.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-zinc-900 via-[#101726] to-zinc-900 border border-white/[0.08] p-6 flex flex-col justify-between text-center">
              <span className="text-xs font-semibold text-[#00F0FF]">
                {contentItem.brand.businessName}
              </span>
              <p className="text-lg font-bold text-white my-auto">{contentItem.title}</p>
              <div className="p-2.5 bg-[#00F0FF] text-[#0A0D14] rounded-xl text-xs font-bold">
                📞 {contentItem.brand.phoneNumber}
              </div>
            </div>
          )}
        </div>

        {/* Caption Tabs (Instagram, Facebook, LinkedIn, X) */}
        <div className="p-4 rounded-2xl bg-[#111722]/80 border border-white/[0.06] space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "INSTAGRAM_BUSINESS", name: "Instagram", icon: Instagram, color: "text-pink-400" },
              { id: "FACEBOOK_PAGE", name: "Facebook", icon: Facebook, color: "text-blue-400" },
              { id: "LINKEDIN", name: "LinkedIn", icon: Linkedin, color: "text-sky-400" },
              { id: "X_TWITTER", name: "X", icon: Twitter, color: "text-zinc-200" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                    active
                      ? "bg-white/[0.12] text-white border border-white/[0.15]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/[0.04] text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
            {getActiveCaption()}
          </div>
        </div>
      </main>

      {/* Sticky Bottom 1-Tap Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-white/[0.1] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="max-w-md mx-auto space-y-2.5">
          <button
            onClick={() => handleDecision("APPROVE")}
            disabled={submitting}
            className="w-full h-13 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>Approve & Schedule (1-Tap)</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowNotesModal(true)}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
            <span>Request Changes / Edit Copy</span>
          </button>
        </div>
      </div>

      {/* Request Changes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#121824] border border-white/[0.1] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>What should be changed?</span>
              </h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <textarea
              rows={3}
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="e.g. Please change discount from 40% to 50%, and add Durga Puja special tag..."
              className="w-full px-3.5 py-3 rounded-xl bg-zinc-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
            />

            <button
              onClick={() => handleDecision("REQUEST_CHANGES", changeNotes)}
              disabled={submitting || !changeNotes.trim()}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Feedback to Team</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
