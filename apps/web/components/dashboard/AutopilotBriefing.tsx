"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Mic,
  Share2,
  X,
  ArrowRight,
  Layers,
} from "lucide-react";

interface AutopilotBriefingProps {
  businessName: string;
  stats: {
    publishedCount: number;
    scheduledCount: number;
    inReviewCount: number;
  };
  autopilot: {
    nextScheduled?: { id: string; title: string; scheduledFor: string } | null;
    pendingReviewItem?: { id: string; title: string; createdAt: string } | null;
  };
  phoneNumber?: string;
}

const REGIONAL_OFFERS = [
  {
    title: "Weekend Flash Sale (Flat 50% Off)",
    category: "Seasonal",
    brief: "Create a promotional poster announcing our exclusive Weekend Flash Sale: Flat 50% discount on all premium salon services. Limited slots available this Saturday and Sunday. Call now to reserve your appointment.",
  },
  {
    title: "Regional Festive Festival Combo",
    category: "Cultural",
    brief: "Design a festive special package offering complete makeover and hair spa combo for just ₹1,499. Traditional Bengali aesthetic with gold and vermilion accents. Offer valid for a limited period.",
  },
  {
    title: "Monday Rush Customer Retention Sale",
    category: "Retention",
    brief: "Get an instant ₹300 voucher on any service bill above ₹999 booked today. Valid only for today's walk-ins and phone appointments.",
  },
  {
    title: "Customer Referral & Loyalty Reward",
    category: "Referral",
    brief: "Refer a colleague or family member and both receive a complimentary consultation plus 20% off your next visit. Share our post to unlock an exclusive voucher.",
  },
];

export function AutopilotBriefing({
  businessName,
  stats,
  autopilot,
  phoneNumber,
}: AutopilotBriefingProps) {
  const router = useRouter();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(REGIONAL_OFFERS[0]);

  // Determine IST time greeting
  const getGreeting = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const hour = istDate.getUTCHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleLaunchOffer = (brief: string) => {
    const encoded = encodeURIComponent(brief);
    router.push(`/content?prompt=${encoded}`);
  };

  const handleSendWhatsAppApproval = () => {
    if (autopilot.pendingReviewItem) {
      const msg = encodeURIComponent(
        `Namaste! Your new social media promotion "${autopilot.pendingReviewItem.title}" is ready for review. Tap to preview and approve: ${window.location.origin}/content`
      );
      window.open(`https://wa.me/${phoneNumber?.replace(/\D/g, "") || ""}?text=${msg}`, "_blank");
    } else {
      const msg = encodeURIComponent(
        `Greetings from ${businessName}. All scheduled social media promotions are currently up to date on ABCD Social Hub.`
      );
      window.open(`https://wa.me/${phoneNumber?.replace(/\D/g, "") || ""}?text=${msg}`, "_blank");
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-[#111722]/90 border border-zinc-800 p-6 sm:p-7 relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Main Greeting & Status Brief */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#00F0FF]/10 border border-[#00F0FF]/25 text-[#00F0FF] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autopilot Engine Active • IST Dispatch Schedule</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {getGreeting()},{" "}
              <span className="text-[#00F0FF]">
                {businessName}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Your autonomous marketing engine is actively safeguarding and publishing your regional
              promotional assets across connected Meta, Instagram, and LinkedIn channels.
            </p>

            {/* 3 Core Status Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Pill 1 */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Published Today
                  </div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {stats.publishedCount > 0
                      ? `${stats.publishedCount} Posts Dispatched`
                      : "Engine Standing By"}
                  </div>
                </div>
              </div>

              {/* Pill 2 */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Next In Queue
                  </div>
                  <div className="text-xs font-semibold text-zinc-200 truncate">
                    {autopilot.nextScheduled
                      ? new Date(autopilot.nextScheduled.scheduledFor).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Kolkata",
                        }) + " IST"
                      : stats.scheduledCount > 0
                      ? `${stats.scheduledCount} in Queue`
                      : "Queue Ready"}
                  </div>
                </div>
              </div>

              {/* Pill 3 */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-2.5">
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    stats.inReviewCount > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                />
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Review Required
                  </div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {stats.inReviewCount > 0
                      ? `${stats.inReviewCount} Awaiting Approval`
                      : "0 Pending Review"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Action Dock */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center">
            <button
              onClick={() => setShowOfferModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-[#0A0D14]" />
              <span>Regional Campaign Templates</span>
            </button>

            <Link
              href="/content?mode=voice"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs transition-all active:scale-95"
            >
              <Mic className="w-4 h-4 text-[#00F0FF]" />
              <span>Voice Memo Prompt</span>
            </Link>

            <button
              onClick={handleSendWhatsAppApproval}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Send WhatsApp Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Regional Festive Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-[#111722] border border-zinc-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-[#00F0FF]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Regional Campaign Templates
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Curated marketing hooks for Bengali and Indian commercial calendars
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {REGIONAL_OFFERS.map((offer, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedOffer(offer)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedOffer.title === offer.title
                      ? "bg-[#00F0FF]/10 border-[#00F0FF]/40 shadow-sm"
                      : "bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-zinc-100">
                      {offer.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-white/[0.06] text-zinc-300">
                      {offer.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {offer.brief}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setShowOfferModal(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLaunchOffer(selectedOffer.brief)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs transition-all shadow-md active:scale-95"
              >
                <span>Draft Campaign in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
