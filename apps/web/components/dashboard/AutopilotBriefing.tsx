"use client";

import { useState, useTransition } from "react";
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
  Flame,
  Calendar,
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
    title: "🎉 Festive Weekend Blast (50% Off)",
    category: "Seasonal",
    brief: "Create a vibrant Bengali and English promotional poster announcing our exclusive Weekend Flash Sale: Flat 50% discount on all premium services. Limited slots available this Saturday & Sunday. Call now to book!",
  },
  {
    title: "🌺 Durga Puja / Festival Special Combo",
    category: "Cultural",
    brief: "Design a festive Pujo special package offering complete makeover & hair spa combo for just ₹1,499. Traditional festive Bengali aesthetic with gold & vermilion accents. Offer valid till Ashtami night.",
  },
  {
    title: "⚡ Monday Rush Special Flash Sale",
    category: "Retention",
    brief: "Beat the Monday blues! Get an instant ₹300 cashback voucher on any bill above ₹999 booked today. Valid only for today's walk-ins and phone appointments.",
  },
  {
    title: "🌟 Customer Loyalty Appreciation",
    category: "Referral",
    brief: "Refer a friend or family member and both of you receive a complimentary consultation plus 20% off your next visit. Tag us in your stories to unlock an extra gift voucher!",
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
    // Current IST hour
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
        `Namaste! Your new social media promo "${autopilot.pendingReviewItem.title}" is ready for review. Tap to preview and approve: ${window.location.origin}/content`
      );
      window.open(`https://wa.me/${phoneNumber?.replace(/\D/g, "") || ""}?text=${msg}`, "_blank");
    } else {
      const msg = encodeURIComponent(
        `Namaste from ${businessName}! All automated social promotions are currently up to date on ABCD Social Hub.`
      );
      window.open(`https://wa.me/${phoneNumber?.replace(/\D/g, "") || ""}?text=${msg}`, "_blank");
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-[#121826] via-[#101522] to-[#0D111A] border border-white/[0.08] shadow-xl overflow-hidden p-5 sm:p-7 relative">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#00F0FF]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Main Greeting & Status Brief */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/25 text-[#00F0FF] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Autopilot Engine Online • IST Schedule Active</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              {getGreeting()},{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-[#00F0FF] to-sky-400">
                {businessName}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Your autonomous marketing engine is actively safeguarding and publishing your regional
              Bengali & Indian English promotional assets across Meta, Instagram, and connected channels.
            </p>

            {/* 3 Core Status Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Pill 1: What AI Did */}
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    AI Work Today
                  </div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {stats.publishedCount > 0
                      ? `${stats.publishedCount} Posts Published`
                      : "Engine Ready & Standing By"}
                  </div>
                </div>
              </div>

              {/* Pill 2: What's Scheduled Next */}
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Scheduled Next
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
                      : "Queue clear"}
                  </div>
                </div>
              </div>

              {/* Pill 3: Action Required */}
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-start gap-2.5">
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    stats.inReviewCount > 0 ? "text-amber-400 animate-bounce" : "text-emerald-400"
                  }`}
                />
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Action Required
                  </div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {stats.inReviewCount > 0
                      ? `${stats.inReviewCount} Waiting Approval`
                      : "0 Pending Review 🎉"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Action Dock */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center">
            <button
              onClick={() => setShowOfferModal(true)}
              className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs sm:text-sm transition-all shadow-md shadow-[#00F0FF]/25 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-[#0A0D14]" />
              <span>1-Tap Regional Offer</span>
            </button>

            <Link
              href="/content?mode=voice"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-zinc-100 font-semibold text-xs sm:text-sm transition-all active:scale-95"
            >
              <Mic className="w-4 h-4 text-[#00F0FF]" />
              <span>Voice Memo Brief</span>
            </Link>

            <button
              onClick={handleSendWhatsAppApproval}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-semibold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Push WhatsApp Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Regional Festive Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-[#111722] border border-white/[0.1] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-[#00F0FF]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">
                    1-Tap Regional & Festive Templates
                  </h3>
                  <p className="text-xs text-zinc-400">
                    High-converting templates tailored for Bengali festivals and Indian business
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {REGIONAL_OFFERS.map((offer, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedOffer(offer)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedOffer.title === offer.title
                      ? "bg-[#00F0FF]/10 border-[#00F0FF]/50 shadow-sm"
                      : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                      {offer.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/[0.08] text-zinc-300">
                      {offer.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {offer.brief}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
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
                <span>Draft This Promo Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
