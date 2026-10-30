"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  ExternalLink,
  ShieldCheck,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";

interface ChannelAccount {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
  updatedAt: string;
}

interface ChannelHealthWidgetProps {
  channels: {
    FACEBOOK_PAGE: ChannelAccount | null;
    INSTAGRAM_BUSINESS: ChannelAccount | null;
    LINKEDIN: ChannelAccount | null;
    X_TWITTER: ChannelAccount | null;
  };
  onRefresh?: () => void;
}

const CHANNEL_CONFIG = [
  {
    key: "FACEBOOK_PAGE",
    label: "Facebook",
    icon: Facebook,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    docsUrl: "https://developers.facebook.com/docs/pages",
  },
  {
    key: "INSTAGRAM_BUSINESS",
    label: "Instagram",
    icon: Instagram,
    iconColor: "text-pink-500",
    bgColor: "bg-pink-500/10 border-pink-500/20",
    docsUrl: "https://developers.facebook.com/docs/instagram-api",
  },
  {
    key: "LINKEDIN",
    label: "LinkedIn",
    icon: Linkedin,
    iconColor: "text-sky-500",
    bgColor: "bg-sky-500/10 border-sky-500/20",
    docsUrl: "https://learn.microsoft.com/en-us/linkedin/shared/authentication-and-authorization",
  },
  {
    key: "X_TWITTER",
    label: "X (Twitter)",
    icon: Twitter,
    iconColor: "text-foreground",
    bgColor: "bg-muted border-border",
    docsUrl: "https://developer.x.com/en/docs",
  },
] as const;

export function ChannelHealthWidget({ channels, onRefresh }: ChannelHealthWidgetProps) {
  const [connectModalPlatform, setConnectModalPlatform] = useState<string | null>(null);
  const [accountName, setAccountName] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!connectModalPlatform) return;
    const origBody = document.body.style.overflow;
    const origDoc = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origDoc;
    };
  }, [connectModalPlatform]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectModalPlatform || !accountName || !tokenInput) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: connectModalPlatform,
          platformAccountId: `${connectModalPlatform.toLowerCase()}_${Date.now()}`,
          accountName,
          accessToken: tokenInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to link channel");
      }

      setMessage("Channel connected securely with AES-256 token encryption!");
      setTimeout(() => {
        setConnectModalPlatform(null);
        setAccountName("");
        setTokenInput("");
        setMessage(null);
        if (onRefresh) onRefresh();
      }, 1200);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-card border border-border shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Live Channel Health</h3>
          </div>
          <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Encrypted AES-256
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 flex-1 items-stretch">
          {CHANNEL_CONFIG.map((cfg) => {
            const account = channels[cfg.key as keyof typeof channels];
            const isConnected = !!account && account.isActive;
            const Icon = cfg.icon;

            return (
              <div
                key={cfg.key}
                className={`p-3 rounded-lg border flex flex-col justify-between gap-2.5 transition-all min-h-[105px] ${
                  isConnected
                    ? "bg-muted/40 border-border"
                    : "bg-muted/15 border-border/70 hover:border-border"
                }`}
              >
                {/* Channel Header: Icon + Single-Line Title + Status Badge */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${cfg.iconColor}`} />
                    <span className="text-xs font-semibold text-foreground truncate">{cfg.label}</span>
                  </div>
                  {isConnected ? (
                    <span className="shrink-0 flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Online
                    </span>
                  ) : (
                    <span className="shrink-0 flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full border border-border">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Offline
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-muted-foreground truncate">
                  {isConnected
                    ? `@${account?.accountName || "Active"}`
                    : "No authorized credential"}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {isConnected
                      ? `Sync: ${new Date(account!.updatedAt).toLocaleDateString("en-IN")}`
                      : "Direct API"}
                  </span>
                  <button
                    onClick={() => {
                      setConnectModalPlatform(cfg.key);
                      setAccountName(account?.accountName || "");
                    }}
                    className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      isConnected
                        ? "text-foreground bg-muted hover:bg-accent"
                        : "text-primary bg-primary/10 hover:bg-primary/20"
                    }`}
                  >
                    {isConnected ? "Refresh" : "+ Link"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connect / Refresh Modal */}
      {mounted && connectModalPlatform && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setConnectModalPlatform(null);
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Connect {connectModalPlatform.replace("_", " ")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConnectModalPlatform(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Account / Handle Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. CalcuttaStylingSalon"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Official Long-Lived Access Token
                </label>
                <input
                  type="password"
                  placeholder="EAA... or API Key Token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Stored with AES-256 symmetric encryption with key held outside database.
                </p>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    message.startsWith("Error")
                      ? "bg-rose-500/10 border border-rose-500/20 text-rose-500"
                      : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setConnectModalPlatform(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Encrypting...</span>
                    </>
                  ) : (
                    <span>Authorize Channel</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
