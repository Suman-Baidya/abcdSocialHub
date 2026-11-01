import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — ABCD Social Hub",
  description: "Read our transparent privacy policy regarding data collection, social tokens encryption, and user rights.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
        <div className="space-y-3 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Security & Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Last Updated: November 2026 • Compliant with Indian Information Technology Act, 2000 & DPDP Act
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-muted-foreground space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">1. Introduction</h2>
            <p>
              ABCD Social Hub (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the cloud marketing automation platform available at abcdsocial.com. This Privacy Policy describes how we collect, use, encrypt, and disclose personal and business information when you use our web applications and publishing services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Credentials:</strong> Name, work email address, phone number, and hashed passwords.</li>
              <li><strong>Brand Information:</strong> Business logos, phone numbers, addresses, brand hex colors, and promotional campaign prompts.</li>
              <li><strong>Social Media Access Tokens:</strong> OAuth tokens received from Meta (Instagram & Facebook), LinkedIn, YouTube, and X strictly required for publishing content on your behalf.</li>
              <li><strong>Billing Information:</strong> Transaction identifiers and payment status handled through Razorpay. We do not store complete debit/credit card numbers or UPI MPINs on our servers.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">3. Token Security & Multi-Tenant Isolation</h2>
            <p>
              All social platform access tokens are encrypted using authenticated AES-256-GCM encryption with cryptographic keys stored outside the primary database. Data is strictly isolated by workspace ID with zero cross-tenant access. Tokens are decrypted only inside worker processes at the moment of publishing and are never exposed to client browsers or application logs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">4. Official API Compliance</h2>
            <p>
              Our platform connects exclusively through official developer APIs (Meta Graph API, Google YouTube Data API, LinkedIn API, X API v2). We do not employ web scrapers, browser bots, or unofficial WhatsApp automation libraries.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">5. Data Deletion & Your Rights</h2>
            <p>
              You maintain full ownership of your promotional content and media. You may disconnect social channels, delete generated drafts, or request complete account erasure at any time via your dashboard settings or by contacting our Data Protection Officer at <strong>sb.abcd321@gmail.com</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">6. Contact Information</h2>
            <p>
              For questions regarding this policy, please reach out to us at:
              <br />
              <strong>Email:</strong> sb.abcd321@gmail.com
              <br />
              <strong>WhatsApp Support:</strong> +91 8167685731 (WhatsApp Only, No Calls)
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
