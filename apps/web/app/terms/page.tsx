import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions — ABCD Social Hub",
  description: "Read our terms of service governing software use, subscription plans, and content ownership.",
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
        <div className="space-y-3 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary">
            <FileText className="w-3.5 h-3.5" />
            <span>Service Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Effective Date: November 2026 • Governing Laws of India (West Bengal Jurisdiction)
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-muted-foreground space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By signing up, creating a workspace, or using ABCD Social Hub, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">2. Description of Service</h2>
            <p>
              ABCD Social Hub provides an autonomous marketing and social publishing software platform allowing users to generate marketing graphics, draft copy using artificial intelligence, review drafts via WhatsApp magic-links, and schedule publications to supported third-party social media networks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">3. User Responsibilities & Acceptable Content</h2>
            <p>
              You are responsible for all text, prompts, logos, and promotional offers published through your account. You agree not to publish content that is unlawful, defamatory, misleading, abusive, infringing on third-party intellectual property, or contrary to social network community standards.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">4. Subscriptions, Fees & Billing</h2>
            <p>
              Paid plans are billed on a recurring monthly basis through Razorpay UPI Autopay or authorized card billing. All prices are listed in Indian Rupees (₹) and are inclusive or exclusive of applicable Goods and Services Tax (GST) as specified during checkout.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">5. Service Availability & Third-Party APIs</h2>
            <p>
              While we strive for 99.8% uptime, publishing operations depend on official external platform APIs (Meta, Google, LinkedIn, X). We are not liable for transient network disruptions, platform policy changes, or temporary rate limits imposed by third-party social networks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">6. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in West Bengal, India.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">7. Support Inquiries</h2>
            <p>
              For questions regarding these terms, contact:
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
