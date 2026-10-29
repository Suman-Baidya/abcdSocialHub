"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  Sparkles,
  CheckCircle2,
  Zap,
  ShieldCheck,
  AlertCircle,
  QrCode,
  History,
  RefreshCw,
  Check,
  ArrowRight,
  Lock,
  Layers,
  ChevronRight,
  X,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";

interface BillingData {
  workspaceId: string;
  organizationId: string;
  organizationName: string;
  subscription: {
    planId: string;
    status: string;
    currentPeriodEnd: string | null;
    razorpaySubId: string | null;
  };
  credits: {
    allocated: number;
    usedThisMonth: number;
    remaining: number;
  };
  plans: Record<
    string,
    {
      id: string;
      name: string;
      priceInRupees: number;
      credits: number;
      features: string[];
    }
  >;
  recentUsage: Array<{
    id: string;
    actionType: string;
    creditsUsed: number;
    metadata: any;
    createdAt: string;
  }>;
  razorpayKeyId: string;
}

export default function BillingPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState<null | { planName: string; price: number; credits: number }>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const user = session?.user as any;
  const isStaff = user?.role === "STAFF";

  const fetchBilling = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/billing");
      if (!res.ok) {
        if (res.status === 403) {
          setError("PERMISSION_DENIED");
          return;
        }
        throw new Error(`Failed to load billing details (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch billing info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  // Format currency in Indian standard
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date in IST
  const formatIST = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Dynamically load Razorpay SDK
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Initiate Razorpay Standard Checkout
  const handleCheckout = async (planId: "starter" | "growth" | "topup_50") => {
    if (!data?.workspaceId) return;
    try {
      setProcessingPlan(planId);
      setActionSuccess(null);

      // Create checkout session
      const orderRes = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          workspaceId: data.workspaceId,
        }),
      });

      if (!orderRes.ok) {
        const errJson = await orderRes.json();
        throw new Error(errJson.error || "Order initiation failed");
      }

      const orderData = await orderRes.json();

      // If in demo mock mode or keys missing, automatically prompt mock activation
      if (orderData.isMock) {
        await handleMockActivate(planId);
        return;
      }

      // Live Razorpay popup checkout
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Razorpay checkout SDK failed to load. Check internet connection.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ABCD Social Hub",
        description: `Upgrade to ${orderData.plan.name}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user.name,
          email: orderData.user.email,
          contact: "+918944899747",
        },
        theme: {
          color: "#00F0FF",
        },
        handler: async (response: any) => {
          // Verify signature on server
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workspaceId: data.workspaceId,
              planId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          if (!verifyRes.ok) {
            throw new Error("Payment signature verification failed");
          }

          setActionSuccess(`Payment successful! ${orderData.plan.name} is now active.`);
          await fetchBilling();
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        alert(`Payment Failed: ${resp.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Checkout failed");
    } finally {
      setProcessingPlan(null);
    }
  };

  // Instant Dev/Demo Mock Activation
  const handleMockActivate = async (planId: "starter" | "growth" | "topup_50") => {
    if (!data?.workspaceId) return;
    try {
      setProcessingPlan(planId);
      const res = await fetch("/api/billing/mock-activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          workspaceId: data.workspaceId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Activation failed");
      }

      const planName = data.plans[planId]?.name || planId;
      setActionSuccess(`Plan updated! Activated ${planName}`);
      await fetchBilling();
    } catch (err: any) {
      alert(err.message || "Failed to switch plan");
    } finally {
      setProcessingPlan(null);
    }
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse p-4 sm:p-6">
        <div className="h-10 w-64 bg-zinc-800/60 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-zinc-800/40 rounded-2xl border border-zinc-800/80" />
          <div className="h-44 bg-zinc-800/40 rounded-2xl border border-zinc-800/80" />
          <div className="h-44 bg-zinc-800/40 rounded-2xl border border-zinc-800/80" />
        </div>
        <div className="h-72 bg-zinc-800/30 rounded-2xl border border-zinc-800/80" />
      </div>
    );
  }

  // 2. Permission Denied State (Staff)
  if (isStaff || error === "PERMISSION_DENIED") {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl border border-red-500/20 bg-[#121722]/80 backdrop-blur-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-sm text-zinc-400">
          Staff accounts do not have permission to access billing, subscriptions, or financial ledgers.
          Please contact your workspace Owner or Admin for changes.
        </p>
      </div>
    );
  }

  // 3. Error State with Retry
  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl border border-red-500/20 bg-[#121722]/80 backdrop-blur-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Unable to Load Billing</h2>
        <p className="text-sm text-zinc-400">{error || "A connection error occurred."}</p>
        <button
          onClick={fetchBilling}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const { subscription, credits, plans, recentUsage } = data;
  const currentPlanKey = subscription.planId || "starter";
  const usedPercent = Math.min(
    100,
    Math.round((credits.usedThisMonth / (credits.allocated || 1)) * 100)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 pb-24 animate-in fade-in duration-300">
      <PageBreadcrumb pageTitle="Billing & Subscriptions" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Billing & Subscriptions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
              India UPI & Cards
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your AI generation quotas, subscription tiers, and append-only usage credits.
          </p>
        </div>

        <button
          onClick={() =>
            setShowQrModal({
              planName: "Sovereign UPI Quick Top-Up",
              price: 299,
              credits: 50,
            })
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121722] hover:bg-zinc-800 border border-zinc-700/80 text-sm font-semibold text-zinc-200 transition-all shadow-sm"
        >
          <QrCode className="w-4 h-4 text-[#00F0FF]" />
          Instant UPI QR Pay
        </button>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-xs hover:underline text-emerald-400"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Plan Card */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-[#121722]/80 backdrop-blur-xl space-y-3 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#00F0FF]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Active Tier
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                subscription.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              }`}
            >
              {subscription.status}
            </span>
          </div>

          <div className="text-2xl font-bold text-white capitalize flex items-center gap-2">
            {plans[currentPlanKey]?.name || currentPlanKey}
            {currentPlanKey === "growth" && <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />}
          </div>

          <p className="text-xs text-zinc-400">
            {subscription.currentPeriodEnd
              ? `Renews on ${formatIST(subscription.currentPeriodEnd)}`
              : "Standard monthly cycle"}
          </p>
        </div>

        {/* Credit Quota Meter */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-[#121722]/80 backdrop-blur-xl space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Monthly Creative Credits
            </span>
            <span className="text-sm font-bold text-zinc-200">
              <span className="text-[#00F0FF] font-mono text-base">{credits.remaining}</span>{" "}
              available / {credits.allocated} quota
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usedPercent > 85 ? "bg-amber-500" : "bg-gradient-to-r from-[#00F0FF] to-blue-500"
              }`}
              style={{ width: `${Math.max(4, usedPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <span>{credits.usedThisMonth} used this month ({usedPercent}%)</span>
            <button
              onClick={() => handleCheckout("topup_50")}
              disabled={processingPlan === "topup_50"}
              className="text-xs text-[#00F0FF] hover:underline font-semibold flex items-center gap-1"
            >
              + Top-up 50 credits (₹299)
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Plans Selector */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Choose Your Plan</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Automated billing via UPI Autopay, Debit/Credit Cards, or sovereign QR checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Starter Plan (₹499) */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border transition-all relative flex flex-col justify-between ${
              currentPlanKey === "starter"
                ? "border-[#00F0FF]/50 bg-[#121722] shadow-lg shadow-[#00F0FF]/5 ring-1 ring-[#00F0FF]/30"
                : "border-zinc-800 bg-[#121722]/50 hover:border-zinc-700"
            }`}
          >
            {currentPlanKey === "starter" && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                CURRENT PLAN
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Ideal for solo barbers, beauty parlours, dental clinics & small tutors.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {formatINR(plans.starter?.priceInRupees || 499)}
                </span>
                <span className="text-xs sm:text-sm text-zinc-400">/ month</span>
              </div>

              <div className="h-px bg-zinc-800 my-4" />

              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
                {plans.starter?.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 space-y-2">
              <button
                onClick={() => handleCheckout("starter")}
                disabled={processingPlan === "starter" || currentPlanKey === "starter"}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  currentPlanKey === "starter"
                    ? "bg-zinc-800/80 text-zinc-400 cursor-default"
                    : "bg-[#00F0FF] hover:bg-[#00D0DF] text-[#0A0D14] shadow-md shadow-[#00F0FF]/20"
                }`}
              >
                {processingPlan === "starter" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : currentPlanKey === "starter" ? (
                  "Active Tier"
                ) : (
                  <>Select Starter Tier <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <button
                onClick={() => handleMockActivate("starter")}
                disabled={processingPlan === "starter"}
                className="w-full py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                (Dev mode: 1-click test activate)
              </button>
            </div>
          </div>

          {/* Growth Plan (₹999) */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border transition-all relative flex flex-col justify-between ${
              currentPlanKey === "growth"
                ? "border-[#00F0FF]/50 bg-[#121722] shadow-lg shadow-[#00F0FF]/5 ring-1 ring-[#00F0FF]/30"
                : "border-zinc-800 bg-[#121722]/50 hover:border-zinc-700"
            }`}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                RECOMMENDED
              </span>
              {currentPlanKey === "growth" && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                  CURRENT
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Growth
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  For growing retail outlets, multi-doctor polyclinics & local agencies.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {formatINR(plans.growth?.priceInRupees || 999)}
                </span>
                <span className="text-xs sm:text-sm text-zinc-400">/ month</span>
              </div>

              <div className="h-px bg-zinc-800 my-4" />

              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
                {plans.growth?.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 space-y-2">
              <button
                onClick={() => handleCheckout("growth")}
                disabled={processingPlan === "growth" || currentPlanKey === "growth"}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  currentPlanKey === "growth"
                    ? "bg-zinc-800/80 text-zinc-400 cursor-default"
                    : "bg-gradient-to-r from-[#00F0FF] to-blue-500 hover:from-[#00D0DF] hover:to-blue-600 text-[#0A0D14] font-bold shadow-md shadow-[#00F0FF]/25"
                }`}
              >
                {processingPlan === "growth" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : currentPlanKey === "growth" ? (
                  "Active Tier"
                ) : (
                  <>Upgrade to Growth Tier <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <button
                onClick={() => handleMockActivate("growth")}
                disabled={processingPlan === "growth"}
                className="w-full py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                (Dev mode: 1-click test activate)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Usage Ledger Table */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-[#121722]/80 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="text-lg font-bold text-white">Append-Only Credit Ledger</h3>
          </div>
          <span className="text-xs text-zinc-400">Strict Tenancy & Audit Log Protected</span>
        </div>

        {recentUsage.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center rounded-xl border border-dashed border-zinc-800 space-y-2">
            <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-400">No credit deductions yet this cycle.</p>
            <p className="text-xs text-zinc-400">
              Draft promotional posts or synthesize regional voiceovers to view usage records.
            </p>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase font-semibold">
                  <th className="pb-3 px-2">Date (IST)</th>
                  <th className="pb-3 px-2">Action</th>
                  <th className="pb-3 px-2 text-right">Credits Change</th>
                  <th className="pb-3 px-2 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {recentUsage.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3 px-2 text-zinc-400 whitespace-nowrap">
                      {formatIST(item.createdAt)}
                    </td>
                    <td className="py-3 px-2 text-zinc-200 font-medium">
                      {item.actionType.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-semibold">
                      {item.creditsUsed < 0 ? (
                        <span className="text-emerald-400">+{Math.abs(item.creditsUsed)}</span>
                      ) : item.creditsUsed === 0 ? (
                        <span className="text-zinc-500">0</span>
                      ) : (
                        <span className="text-amber-400">-{item.creditsUsed}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-zinc-400 text-xs font-mono">
                      {item.metadata?.paymentId || item.metadata?.demoRef || item.id.slice(0, 8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sovereign UPI QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121722] border border-zinc-700 rounded-2xl p-6 space-y-5 text-center shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#00F0FF]" /> Direct Sovereign UPI
              </h3>
              <button
                onClick={() => setShowQrModal(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-400">
                Scan with any Indian UPI App (PhonePe, GPay, Paytm, CRED). Zero transaction surcharges.
              </p>
              <div className="text-2xl font-black text-white text-[#00F0FF]">
                {formatINR(showQrModal.price)}
              </div>
            </div>

            {/* Generated UPI QR Code for Indian VPA */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl flex items-center justify-center shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `upi://pay?pa=8167685731@okaxis&pn=ABCD+Social+Hub&am=${showQrModal.price}&cu=INR&tn=ABCD+${showQrModal.credits}+Credits`
                )}`}
                alt="UPI QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono flex items-center justify-between">
              <span>UPI ID: 8167685731@okaxis</span>
              <span className="text-[#00F0FF] text-[10px] font-sans">Verified Merchant</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={async () => {
                  setShowQrModal(null);
                  await handleMockActivate("topup_50");
                }}
                className="w-full py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00D0DF] text-[#0A0D14] text-xs font-bold transition-all"
              >
                I have completed the payment (Simulate Verification)
              </button>
              <button
                onClick={() => setShowQrModal(null)}
                className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
