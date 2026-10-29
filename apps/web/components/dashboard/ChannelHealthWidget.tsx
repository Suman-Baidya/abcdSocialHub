"use client";

import { useState } from "react";
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  ExternalLink,
  ShieldCheck,
  X,
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
    label: "Facebook Page",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    docsUrl: "https://developers.facebook.com/docs/pages",
  },
  {
    key: "INSTAGRAM_BUSINESS",
    label: "Instagram Professional",
    iconColor: "text-pink-500",
    bgColor: "bg-pink-500/10 border-pink-500/20",
    docsUrl: "https://developers.facebook.com/docs/instagram-api",
  },
  {
    key: "LINKEDIN",
    label: "LinkedIn Company",
    iconColor: "text-sky-500",
    bgColor: "bg-sky-500/10 border-sky-500/20",
    docsUrl: "https://learn.microsoft.com/en-us/linkedin/shared/authentication-and-authorization",
  },
  {
    key: "X_TWITTER",
    label: "X (Twitter) Feed",
    iconColor: "text-zinc-200",
    bgColor: "bg-zinc-500/10 border-zinc-500/20",
    docsUrl: "https://developer.x.com/en/docs",
  },
] as const;

export function ChannelHealthWidget({ channels, onRefresh }: ChannelHealthWidgetProps) {
  const [connectModalPlatform, setConnectModalPlatform] = useState<string | null>(null);
  const [accountName, setAccountName] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-semibold text-zinc-100">Live Channel Health</h3>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Encrypted AES-256
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CHANNEL_CONFIG.map((cfg) => {
            const account = channels[cfg.key as keyof typeof channels];
            const isConnected = !!account && account.isActive;

            return (
              <div
                key={cfg.key}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                  isConnected
                    ? "bg-white/[0.03] border-white/[0.08]"
                    : "bg-zinc-900/40 border-white/[0.04] opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">{cfg.label}</span>
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Offline
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-zinc-400 truncate">
                  {isConnected
                    ? `@${account?.accountName || "Active"}`
                    : "No authorized credential"}
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">
                    {isConnected
                      ? `Sync: ${new Date(account!.updatedAt).toLocaleDateString("en-IN")}`
                      : "Direct API"}
                  </span>
                  <button
                    onClick={() => {
                      setConnectModalPlatform(cfg.key);
                      setAccountName(account?.accountName || "");
                    }}
                    className={`text-[11px] font-medium px-2 py-1 rounded transition-colors ${
                      isConnected
                        ? "text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1]"
                        : "text-[#00F0FF] hover:text-[#00D4E0] bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20"
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
      {connectModalPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#111722] border border-white/[0.1] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
                <h3 className="text-sm font-semibold text-zinc-100">
                  Connect {connectModalPlatform.replace("_", " ")}
                </h3>
              </div>
              <button
                onClick={() => setConnectModalPlatform(null)}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Account / Handle Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. salonderoyal_official"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-none focus:border-[#00F0FF]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  API Access Token
                </label>
                <input
                  type="password"
                  required
                  placeholder="Paste long-lived graph / bearer token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-none focus:border-[#00F0FF]/50 font-mono"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  Tokens are encrypted with AES-256-GCM before database write and never exposed.
                </p>
              </div>

              {message && (
                <div
                  className={`p-2.5 rounded-lg text-xs ${
                    message.startsWith("Error")
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setConnectModalPlatform(null)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Encrypting & Storing..." : "Save Secure Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
