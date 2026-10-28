"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  ShieldCheck,
  ExternalLink,
  Lock,
} from "lucide-react";

interface SocialAccount {
  id: string;
  platform: string;
  platformAccountId: string;
  accountName: string;
  isActive: boolean;
  createdAt: string;
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const [platform, setPlatform] = useState<"INSTAGRAM_BUSINESS" | "FACEBOOK_PAGE" | "LINKEDIN" | "X_TWITTER">("INSTAGRAM_BUSINESS");
  const [platformAccountId, setPlatformAccountId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error("Failed to load accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setError("");

    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          platformAccountId,
          accountName,
          accessToken,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        setPlatformAccountId("");
        setAccountName("");
        setAccessToken("");
        loadAccounts();
      } else {
        setError(data.error || "Failed to connect account");
      }
    } catch (err: any) {
      setError(err?.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    try {
      const res = await fetch(`/api/social?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadAccounts();
      }
    } catch (err) {
      alert("Failed to disconnect");
    }
  };

  const platforms = [
    {
      id: "INSTAGRAM_BUSINESS",
      name: "Instagram Professional",
      description: "Auto-publish 1080×1080 posters with 2-step media container verification.",
      icon: Instagram,
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
    {
      id: "FACEBOOK_PAGE",
      name: "Facebook Page",
      description: "Direct feed and photo publishing with WhatsApp click-to-chat buttons.",
      icon: Facebook,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "LINKEDIN",
      name: "LinkedIn Company",
      description: "Professional updates and B2B announcements.",
      icon: Linkedin,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      id: "X_TWITTER",
      name: "X (Twitter)",
      description: "Punchy short promo tweets and offers.",
      icon: Twitter,
      color: "text-zinc-200 bg-zinc-800 border-zinc-700",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-[#00F0FF]" />
            <span>Social Account Connections</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Connect your official social media channels. Tokens are encrypted with AES-256-GCM.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#00F0FF]/20 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Channel</span>
        </button>
      </div>

      {/* Security Note */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xs text-zinc-400">
          <span className="text-zinc-200 font-semibold">Zero-Token Exposure Policy: </span>
          All tokens are encrypted with authenticated AES-256-GCM before database insertion. Plaintext tokens are never sent to your browser or logged.
        </div>
      </div>

      {/* Grid of Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {platforms.map((p) => {
          const connected = accounts.filter((a) => a.platform === p.id);
          const Icon = p.icon;

          return (
            <div
              key={p.id}
              className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${p.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">{p.name}</h3>
                      <span className="text-[10px] text-zinc-400">Official Graph API</span>
                    </div>
                  </div>

                  {connected.length > 0 ? (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Connected ({connected.length})</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-zinc-500 bg-zinc-900 border border-white/[0.04] px-2 py-0.5 rounded-full">
                      Not Connected
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{p.description}</p>
              </div>

              {/* Connected Accounts Sub-list */}
              {connected.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  {connected.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/[0.04] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-zinc-200 font-medium">{acc.accountName}</span>
                        <div className="text-[10px] text-zinc-500">ID: {acc.platformAccountId}</div>
                      </div>
                      <button
                        onClick={() => handleDisconnect(acc.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                        title="Disconnect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setPlatform(p.id as any);
                  setModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect Another {p.name.split(" ")[0]}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Connect Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleConnect}
            className="w-full max-w-md bg-[#121824] border border-white/[0.1] rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#00F0FF]" />
                <span>Connect Social Channel</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Target Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#00F0FF]"
              >
                <option value="INSTAGRAM_BUSINESS">Instagram Professional</option>
                <option value="FACEBOOK_PAGE">Facebook Page</option>
                <option value="LINKEDIN">LinkedIn Company</option>
                <option value="X_TWITTER">X (Twitter)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Account / Page Display Name
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Kolkata Glamour Salon Official"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Platform Account ID / Page ID
              </label>
              <input
                type="text"
                required
                value={platformAccountId}
                onChange={(e) => setPlatformAccountId(e.target.value)}
                placeholder="e.g. 17841400000000000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Access Token (AES-256 Encrypted)
                </label>
                <button
                  type="button"
                  onClick={() => setAccessToken("mock_token_for_sandbox_test")}
                  className="text-[10px] text-[#00F0FF] hover:underline"
                >
                  Use Sandbox Token
                </button>
              </div>
              <input
                type="password"
                required
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAA... or enter sandbox token"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <button
              type="submit"
              disabled={connecting}
              className="w-full py-3 px-4 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Encrypting & Connecting...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Encrypt & Save Connection</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
