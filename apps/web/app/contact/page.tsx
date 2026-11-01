import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Mail, MessageSquare, Clock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Contact Us — ABCD Social Hub",
  description: "Get in touch with the ABCD Social team via WhatsApp or email.",
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            How can we help your business?
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Have questions about automated social media publishing, custom agency plans, or WhatsApp review integration? Our team is available directly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1: Direct WhatsApp Support */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">WhatsApp Direct Support</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect directly with our operations desk. Fast response for onboarding questions, plan changes, and technical assistance.
              </p>
              <div className="pt-2 text-xs text-foreground font-semibold">
                +91 8167685731 <span className="text-[11px] text-muted-foreground font-normal">(WhatsApp Only, No Calls)</span>
              </div>
            </div>

            <a
              href="https://wa.me/918167685731"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 2: Email Support */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Email Inquiries</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For enterprise billing inquiries, partnership proposals, GST invoices, and data privacy requests.
              </p>
              <div className="pt-2 text-xs text-foreground font-semibold">
                sb.abcd321@gmail.com
              </div>
            </div>

            <a
              href="mailto:sb.abcd321@gmail.com"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs border border-border transition-all active:scale-95"
            >
              <span>Send Email</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Operating Hours & Assurance */}
        <div className="p-6 rounded-2xl bg-card border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>Support Desk Hours: Monday to Saturday, 10:00 AM – 7:00 PM IST</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Verified Meta & Google API Partner</span>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
