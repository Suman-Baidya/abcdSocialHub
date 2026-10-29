"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Loader2,
  RefreshCw,
  Share2,
  Instagram,
  Facebook,
  Sparkles,
} from "lucide-react";
import { useToast, CustomModal } from "@/components/ui/ToastProvider";

interface QueueItem {
  id: string;
  title: string;
  status: string;
  scheduledFor: string | null;
  createdAt: string;
  variants: Array<{
    platform: string;
    caption: string;
    mediaUrl?: string;
  }>;
}

export default function PublishingQueuePage() {
  const { toast } = useToast();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [confirmPublishItem, setConfirmPublishItem] = useState<QueueItem | null>(null);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const loadQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/content/list");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        // Fallback sample items
        setItems([
          {
            id: "sample_1",
            title: "Durga Puja 50% Off Hair Spa",
            status: "SCHEDULED",
            scheduledFor: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            variants: [
              {
                platform: "INSTAGRAM_BUSINESS",
                caption: "উৎসবের বিশেষ অফার! সব সেলুন সার্ভিসে ফ্ল্যাট ৫০% ছাড়।",
                mediaUrl: "https://res.cloudinary.com/mdlaprj0/image/upload/v1793193499/abcd_posters/iy93bkzz4nub2ck4nupw.webp",
              },
            ],
          },
          {
            id: "sample_2",
            title: "Weekend Grooming Package",
            status: "IN_REVIEW",
            scheduledFor: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            variants: [
              {
                platform: "FACEBOOK_PAGE",
                caption: "Special weekend grooming package. Call now to book!",
              },
            ],
          },
          {
            id: "sample_3",
            title: "Diwali Early Bird Announcement",
            status: "PUBLISHED",
            scheduledFor: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
            variants: [
              {
                platform: "INSTAGRAM_BUSINESS",
                caption: "Early bird Diwali deals are live!",
              },
            ],
          },
        ]);
      }
    } catch (err: any) {
      setError("Failed to load queue. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleExecutePublish = async () => {
    if (!confirmPublishItem) return;
    const contentItemId = confirmPublishItem.id;
    setPublishingId(contentItemId);
    setConfirmPublishItem(null);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentItemId,
          action: "PUBLISH_NOW",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          "Published Successfully!",
          `Post dispatched to: ${data.publishedDestinations?.join(", ") || "Connected channels"}`
        );
        // Update local item status
        setItems((prev) =>
          prev.map((item) => (item.id === contentItemId ? { ...item, status: "PUBLISHED" } : item))
        );
      } else {
        toast.error("Publishing Failed", data.error || "Could not publish post to social channels.");
      }
    } catch (err: any) {
      toast.error("Network Error", err.message);
    } finally {
      setPublishingId(null);
    }
  };

  const handlePushWhatsAppReview = (item: QueueItem) => {
    const text = encodeURIComponent(
      `Namaste! Your scheduled promotion "${item.title}" is ready for mobile review. Tap to preview and approve: ${window.location.origin}/content`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast.info("WhatsApp Opened", "Dispatching review link to client WhatsApp.");
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "PUBLISHED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "SCHEDULED":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "IN_REVIEW":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "FAILED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.status === activeFilter;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-[#00F0FF]" />
            <span>Publishing Queue & Calendar</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            pg-boss automated job queue with atomic claiming and official Meta Graph API publishing.
          </p>
        </div>

        <button
          onClick={loadQueue}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 text-xs font-semibold transition-all self-start sm:self-auto active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "SCHEDULED", "IN_REVIEW", "PUBLISHED", "FAILED"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeFilter === f
                ? "bg-[#00F0FF] text-[#0A0D14] font-semibold"
                : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/[0.04]"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#00F0FF] mx-auto" />
          <p className="text-xs text-zinc-400 mt-3">Loading publishing queue from PostgreSQL...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111722]/40 border border-dashed border-white/[0.08] text-center space-y-3">
          <CalendarIcon className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">No posts in this filter</h3>
          <p className="text-xs text-zinc-500">Draft or approve a post in the Content Studio to populate the queue.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const dateStr = item.scheduledFor
              ? new Date(item.scheduledFor).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                }) + " IST"
              : "Immediately";

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center shrink-0">
                    {item.status === "PUBLISHED" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : item.status === "SCHEDULED" ? (
                      <Clock className="w-5 h-5 text-sky-400" />
                    ) : (
                      <CalendarIcon className="w-5 h-5 text-amber-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-100">{item.title}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span>Scheduled: {dateStr}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Instagram className="w-3 h-3 text-pink-400" />
                        <Facebook className="w-3 h-3 text-blue-400" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  {item.status === "IN_REVIEW" && (
                    <button
                      onClick={() => handlePushWhatsAppReview(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp Review</span>
                    </button>
                  )}

                  {item.status !== "PUBLISHED" && (
                    <button
                      onClick={() => setConfirmPublishItem(item)}
                      disabled={publishingId === item.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-500/20"
                    >
                      {publishingId === item.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Publish Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal Popup */}
      <CustomModal
        isOpen={!!confirmPublishItem}
        onClose={() => setConfirmPublishItem(null)}
        title="Confirm Instant Publishing"
        description={`Are you sure you want to publish "${confirmPublishItem?.title}" immediately to connected Meta & Instagram channels?`}
        confirmText="Publish to Live Channels"
        onConfirm={handleExecutePublish}
        isLoading={!!publishingId}
      />
    </div>
  );
}
