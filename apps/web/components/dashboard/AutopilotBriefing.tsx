"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showOfferModal) return;
    const origBody = document.body.style.overflow;
    const origDoc = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origDoc;
    };
  }, [showOfferModal]);

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
      <div className="rounded-xl bg-card border border-border p-4 sm:p-5 relative overflow-hidden backdrop-blur-xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 relative z-10">
          {/* Main Greeting & Status Brief */}
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autopilot Engine Active • IST Dispatch Schedule</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {getGreeting()},{" "}
              <span className="text-primary">
                {businessName}
              </span>
            </h2>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Your autonomous marketing engine is actively safeguarding and publishing your regional
              promotional assets across connected Meta, Instagram, and LinkedIn channels.
            </p>

            {/* 3 Core Status Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Pill 1 */}
              <div className="p-2.5 rounded-lg bg-muted/60 border border-border flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Published Today
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {stats.publishedCount > 0
                      ? `${stats.publishedCount} Posts Dispatched`
                      : "Engine Standing By"}
                  </div>
                </div>
              </div>

              {/* Pill 2 */}
              <div className="p-2.5 rounded-lg bg-muted/60 border border-border flex items-start gap-2">
                <Clock className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Next In Queue
                  </div>
                  <div className="text-xs font-semibold text-foreground truncate">
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
              <div className="p-2.5 rounded-lg bg-muted/60 border border-border flex items-start gap-2">
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    stats.inReviewCount > 0 ? "text-amber-500" : "text-emerald-500"
                  }`}
                />
                <div className="space-y-0.5">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Review Required
                  </div>
                  <div className="text-xs font-semibold text-foreground">
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
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-primary-foreground" />
              <span>Regional Campaign Templates</span>
            </button>

            <Link
              href="/content?mode=voice"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-accent border border-border text-foreground font-semibold text-xs transition-all active:scale-95"
            >
              <Mic className="w-4 h-4 text-primary" />
              <span>Voice Memo Prompt</span>
            </Link>

            <button
              onClick={handleSendWhatsAppApproval}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-500 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Send WhatsApp Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Regional Festive Offer Modal */}
      {mounted && showOfferModal && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowOfferModal(false);
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Regional Campaign Templates
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Curated marketing hooks for Bengali and Indian commercial calendars
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
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
                      ? "bg-primary/10 border-primary/40 shadow-sm"
                      : "bg-muted/50 border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">
                      {offer.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-muted text-foreground border border-border">
                      {offer.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {offer.brief}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleLaunchOffer(selectedOffer.brief)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Draft Campaign in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
