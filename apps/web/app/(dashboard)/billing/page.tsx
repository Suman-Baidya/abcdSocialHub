"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showQrModal) return;
    const origBody = document.body.style.overflow;
    const origDoc = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origDoc;
    };
  }, [showQrModal]);

  const user = session?.user as any;
  const role = user?.role;
  const isBarredFromBilling =
    role === "STAFF" ||
    role === "ADMIN_STAFF" ||
    role === "CREATOR" ||
    role === "GUEST";

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

  // 2. Permission Denied State (Staff, Creators, Guests)
  if (isBarredFromBilling || error === "PERMISSION_DENIED") {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl border border-rose-500/20 bg-card text-card-foreground text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your role ({role ? role.replace("_", " ") : "Member"}) does not have authorization to access billing, subscriptions, or financial ledgers.
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
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      <PageBreadcrumb
        pageTitle="Billing & Plans"
        description="Manage subscription plans, quotas, and credit balances."
        hideBreadcrumb={true}
      >
        <button
          onClick={() =>
            setShowQrModal({
              planName: "Sovereign UPI Quick Top-Up",
              price: 299,
              credits: 50,
            })
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121722] hover:bg-zinc-800 border border-zinc-700/80 text-xs sm:text-sm font-semibold text-zinc-200 transition-all shadow-sm cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-[#00F0FF]" />
          <span>Instant UPI QR Pay</span>
        </button>
      </PageBreadcrumb>

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

      {/* Overview Stat Cards (Compact & sleek) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5">
        {/* Active Plan Card */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-sm space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Active Tier
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                subscription.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
              }`}
            >
              {subscription.status}
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-bold text-foreground capitalize flex items-center gap-2">
            {plans[currentPlanKey]?.name || currentPlanKey}
            {currentPlanKey === "growth" && <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />}
          </div>

          <p className="text-[11px] text-muted-foreground">
            {subscription.currentPeriodEnd
              ? `Renews on ${formatIST(subscription.currentPeriodEnd)}`
              : "Standard monthly cycle"}
          </p>
        </div>

        {/* Credit Quota Meter */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-sm space-y-2.5 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Creative Credits
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              <span className="text-primary font-mono text-sm sm:text-base">{credits.remaining}</span>{" "}
              available / {credits.allocated} quota
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden p-0.5 border border-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usedPercent > 85 ? "bg-amber-500" : "bg-gradient-to-r from-primary to-blue-500"
              }`}
              style={{ width: `${Math.max(4, usedPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <span>{credits.usedThisMonth} used this month ({usedPercent}%)</span>
            <button
              onClick={() => handleCheckout("topup_50")}
              disabled={processingPlan === "topup_50"}
              className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              + Top-up 50 credits (₹299)
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Plans Selector */}
      <div className="space-y-3.5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">Choose Your Plan</h2>
          <p className="text-xs text-muted-foreground">
            Automated billing via UPI Autopay, Debit/Credit Cards, or sovereign QR checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Starter Plan (₹499) */}
          <div
            className={`p-4 sm:p-5 rounded-xl border transition-all relative flex flex-col justify-between ${
              currentPlanKey === "starter"
                ? "border-primary/50 bg-card shadow-md ring-1 ring-primary/30"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            {currentPlanKey === "starter" && (
              <span className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/30">
                CURRENT PLAN
              </span>
            )}

            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Starter</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ideal for solo barbers, beauty parlours, dental clinics & small tutors.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {formatINR(plans.starter?.priceInRupees || 499)}
                </span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>

              <div className="h-px bg-border my-2.5" />

              <ul className="space-y-2 text-xs text-muted-foreground">
                {plans.starter?.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-5 space-y-1.5">
              <button
                onClick={() => handleCheckout("starter")}
                disabled={processingPlan === "starter" || currentPlanKey === "starter"}
                className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  currentPlanKey === "starter"
                    ? "bg-muted text-muted-foreground cursor-default"
                    : "bg-primary hover:opacity-90 text-primary-foreground shadow-sm"
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
                className="w-full py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                (Dev mode: 1-click test activate)
              </button>
            </div>
          </div>

          {/* Growth Plan (₹999) */}
          <div
            className={`p-4 sm:p-5 rounded-xl border transition-all relative flex flex-col justify-between ${
              currentPlanKey === "growth"
                ? "border-primary/50 bg-card shadow-md ring-1 ring-primary/30"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                RECOMMENDED
              </span>
              {currentPlanKey === "growth" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/30">
                  CURRENT
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                  Growth
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  For growing retail outlets, multi-doctor polyclinics & local agencies.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {formatINR(plans.growth?.priceInRupees || 999)}
                </span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>

              <div className="h-px bg-border my-2.5" />

              <ul className="space-y-2 text-xs text-muted-foreground">
                {plans.growth?.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-5 space-y-1.5">
              <button
                onClick={() => handleCheckout("growth")}
                disabled={processingPlan === "growth" || currentPlanKey === "growth"}
                className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  currentPlanKey === "growth"
                    ? "bg-muted text-muted-foreground cursor-default"
                    : "bg-primary hover:opacity-90 text-primary-foreground shadow-sm"
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
                className="w-full py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                (Dev mode: 1-click test activate)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Usage Ledger Table */}
      <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">Append-Only Credit Ledger</h3>
          </div>
          <span className="text-[11px] text-muted-foreground">Strict Tenancy & Audit Log Protected</span>
        </div>

        {recentUsage.length === 0 ? (
          /* Empty State */
          <div className="p-8 text-center rounded-xl border border-dashed border-border space-y-2">
            <Layers className="w-7 h-7 text-muted-foreground mx-auto" />
            <p className="text-xs sm:text-sm text-foreground">No credit deductions yet this cycle.</p>
            <p className="text-[11px] text-muted-foreground">
              Draft promotional posts or synthesize regional voiceovers to view usage records.
            </p>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[10px] uppercase font-semibold">
                  <th className="pb-2.5 px-2">Date (IST)</th>
                  <th className="pb-2.5 px-2">Action</th>
                  <th className="pb-2.5 px-2 text-right">Credits Change</th>
                  <th className="pb-2.5 px-2 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentUsage.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap">
                      {formatIST(item.createdAt)}
                    </td>
                    <td className="py-2.5 px-2 text-foreground font-medium">
                      {item.actionType.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-semibold">
                      {item.creditsUsed < 0 ? (
                        <span className="text-emerald-500">+{Math.abs(item.creditsUsed)}</span>
                      ) : item.creditsUsed === 0 ? (
                        <span className="text-muted-foreground">0</span>
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
      {mounted && showQrModal && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQrModal(null);
          }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-card border border-border rounded-2xl p-6 space-y-5 text-center shadow-2xl relative text-card-foreground animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" /> Instant UPI Pay
              </h3>
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Scan with any UPI App (PhonePe, GPay, Paytm). Zero surcharge.
              </p>
              <div className="text-2xl font-black text-primary">
                {formatINR(showQrModal.price)}
              </div>
            </div>

            {/* Generated UPI QR Code for Indian VPA */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl flex items-center justify-center shadow-lg border border-border">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `upi://pay?pa=8167685731@okaxis&pn=ABCD+Social+Hub&am=${showQrModal.price}&cu=INR&tn=ABCD+${showQrModal.credits}+Credits`
                )}`}
                alt="UPI QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs text-foreground font-mono flex items-center justify-between">
              <span>UPI ID: 8167685731@okaxis</span>
              <span className="text-primary text-[10px] font-sans font-semibold">Verified Merchant</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={async () => {
                  setShowQrModal(null);
                  await handleMockActivate("topup_50");
                }}
                className="w-full py-2.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Simulate Payment Verification
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
