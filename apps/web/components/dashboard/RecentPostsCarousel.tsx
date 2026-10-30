"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Sparkles,
  Eye,
  Copy,
  Check,
  Calendar,
  X,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { STATUS_VARIANTS } from "@abcd/ui";

interface Variant {
  id: string;
  platform: string;
  caption: string;
  mediaUrl?: string | null;
  mediaType: string;
  hashtags: string[];
}

interface PostItem {
  id: string;
  title: string;
  status: string;
  scheduledFor?: string | null;
  createdAt: string;
  variants: Variant[];
}

interface RecentPostsCarouselProps {
  posts: PostItem[];
}

export function RecentPostsCarousel({ posts }: RecentPostsCarouselProps) {
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedPost) return;
    const origBody = document.body.style.overflow;
    const origDoc = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origDoc;
    };
  }, [selectedPost]);

  const handleCopyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-card border border-border backdrop-blur-xl text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">No Creative Posts Generated Yet</h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Your workspace has no drafts or scheduled posters. Generate your first Bengali & English
          promotional poster in 30 seconds.
        </p>
        <Link
          href="/content"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition-all shadow-md active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Content Studio</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border backdrop-blur-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Recent Creative Feed</h3>
          </div>
          <Link
            href="/content"
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
          >
            <span>Open Studio</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const firstVariant = post.variants[0];
            const mediaUrl = firstVariant?.mediaUrl;
            const statusKey = (post.status in STATUS_VARIANTS ? post.status : "PAUSED") as keyof typeof STATUS_VARIANTS;
            const badgeClass = STATUS_VARIANTS[statusKey] || STATUS_VARIANTS.PAUSED;

            return (
              <div
                key={post.id}
                className="group rounded-xl bg-muted/40 border border-border hover:border-primary/40 overflow-hidden transition-all flex flex-col justify-between"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-video w-full bg-muted/60 overflow-hidden flex items-center justify-center">
                  {mediaUrl ? (
                    <img
                      src={mediaUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-[10px]">Poster Rendering</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md ${badgeClass}`}
                    >
                      {post.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-95"
                      title="Quick Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {firstVariant?.caption && (
                      <button
                        onClick={() => handleCopyCaption(firstVariant.caption)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-95"
                        title="Copy Caption"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-foreground line-clamp-1">{post.title}</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {firstVariant?.caption || "Autonomous promotional draft ready for review."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.scheduledFor
                        ? new Date(post.scheduledFor).toLocaleDateString("en-IN")
                        : new Date(post.createdAt).toLocaleDateString("en-IN")}
                    </span>
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="text-primary hover:underline font-medium"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Inspection Modal */}
      {mounted && selectedPost && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPost(null);
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{selectedPost.title}</h3>
                <span className="text-[11px] text-muted-foreground">
                  Status: <strong className="text-foreground">{selectedPost.status}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster Preview */}
            {selectedPost.variants[0]?.mediaUrl && (
              <div className="aspect-square max-w-sm mx-auto rounded-xl overflow-hidden border border-border shadow-lg">
                <img
                  src={selectedPost.variants[0].mediaUrl}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Captions by Platform */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground">Platform Variants & Captions</h4>
              {selectedPost.variants.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">{v.platform}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCaption(v.caption)}
                      className="inline-flex items-center gap-1 text-[11px] text-foreground hover:text-primary bg-card hover:bg-muted px-2 py-0.5 rounded border border-border transition-colors cursor-pointer"
                    >
                      {copiedCaption ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCaption ? "Copied" : "Copy Caption"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                    {v.caption}
                  </p>
                  {v.hashtags && v.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {v.hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] text-sky-500 font-mono">
                          #{h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/content"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span>Edit in Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
