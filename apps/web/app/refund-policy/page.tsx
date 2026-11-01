import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { RefreshCcw, CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Cancellation & Refund Policy — ABCD Social Hub",
  description: "Learn about subscription cancellations, 14-day free trial terms, and refund eligibility.",
};

export default function RefundPolicyPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
        <div className="space-y-3 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary">
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Fair Billing Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Cancellation & Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Clear, transparent policies for subscriptions and payment transactions in Indian Rupees (₹).
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-muted-foreground space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">1. 14-Day Free Pilot Period</h2>
            <p>
              We provide new organizations with a 14-day free pilot period to explore our automated poster generation, WhatsApp review links, and multi-channel scheduling features. No credit card is required to begin the pilot.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">2. Subscription Cancellation</h2>
            <p>
              You can cancel your active subscription at any time directly through the <strong>Platform Billing</strong> page inside your dashboard. Once cancelled:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your recurring billing mandate (UPI Autopay or Card) will be deactivated immediately.</li>
              <li>You will retain access to your workspace and unused monthly poster quotas until the end of your current paid billing period.</li>
              <li>No further charges will be billed to your account after cancellation.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">3. Refund Eligibility</h2>
            <p>
              Because ABCD Social Hub is a software-as-a-service (SaaS) platform that consumes cloud server GPU compute and AI API credits in real-time upon poster generation:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Billing Inquiries & Duplicate Charges:</strong> If you were charged in error, experienced an unauthorized duplicate charge, or encountered a platform failure preventing service delivery, please contact our support team within 7 days of the transaction. Verified erroneous charges will be refunded in full to your original payment method.</li>
              <li><strong>Partial Month Usage:</strong> We do not provide prorated cash refunds for partial month cancellations once poster generations have been consumed in that billing cycle.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">4. Refund Processing Time</h2>
            <p>
              Approved refunds are processed through Razorpay back to your original source of payment (UPI bank account, credit card, or net banking) within <strong>5 to 7 business days</strong>, subject to your issuing bank&apos;s settlement timelines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">5. Requesting Support or Refund</h2>
            <p>
              To initiate a cancellation or refund inquiry, please message our billing desk:
              <br />
              <strong>Email:</strong> sb.abcd321@gmail.com
              <br />
              <strong>WhatsApp:</strong> +91 8167685731 (WhatsApp Only, No Calls)
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
