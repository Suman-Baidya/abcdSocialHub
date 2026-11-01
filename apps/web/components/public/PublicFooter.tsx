import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  ShieldCheck,
  CheckCircle2,
  Mail,
  MessageSquare,
  LayoutDashboard,
  Palette,
  Smartphone,
  CreditCard,
  HelpCircle,
  ShoppingBag,
  HeartPulse,
  Sparkles,
  Zap,
  Building2,
  FileText,
  RefreshCcw,
} from "lucide-react";

interface PublicFooterProps {
  general?: {
    brandName?: string;
    tagline?: string;
    contactEmail?: string;
    contactPhone?: string;
    supportWhatsapp?: string;
    copyrightText?: string;
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      twitter?: string;
      youtube?: string;
    };
  };
}

export function PublicFooter({ general }: PublicFooterProps) {
  const email = general?.contactEmail || "sb.abcd321@gmail.com";
  const whatsappNumber = general?.supportWhatsapp || "+91 8167685731";
  const copyright =
    general?.copyrightText || "© 2026 ABCD Social Hub. All rights reserved.";

  return (
    <footer className="border-t border-border bg-card/60 backdrop-blur-xl text-muted-foreground text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12">
          {/* Brand Info: Logo first, then "ABCD Social Hub" under it, then short description */}
          <div className="lg:col-span-2 space-y-3.5">
            <Link href="/" className="inline-flex flex-col items-start gap-2 group cursor-pointer">
              {/* 1. Logo First */}
              <div className="relative h-10 sm:h-12 w-auto transition-transform group-hover:scale-105">
                <Image
                  src="/logo_blue.png"
                  alt="ABCD Social Hub Logo"
                  width={180}
                  height={48}
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
              {/* 2. Name Under Logo */}
              <span className="font-extrabold text-lg sm:text-xl text-foreground tracking-tight">
                ABCD Social Hub
              </span>
            </Link>

            {/* 3. Short Brand Description */}
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Autonomous social media marketing & promotional graphic automation for businesses across India.
            </p>

            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex items-center gap-2 text-foreground/90">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-primary transition-colors"
                >
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-foreground/90">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <a
                  href="https://wa.me/918167685731"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  WhatsApp: {whatsappNumber}{" "}
                  <span className="text-[11px] text-muted-foreground font-normal">
                    (WhatsApp Only, No Calls)
                  </span>
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={general?.socialLinks?.instagram || "https://instagram.com"}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors flex items-center justify-center"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={general?.socialLinks?.facebook || "https://facebook.com"}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors flex items-center justify-center"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={general?.socialLinks?.linkedin || "https://linkedin.com"}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors flex items-center justify-center"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={general?.socialLinks?.twitter || "https://x.com"}
                target="_blank"
                rel="noreferrer"
                aria-label="X / Twitter"
                className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors flex items-center justify-center"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-primary shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Autopilot Overview</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/services#poster-studio"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <Palette className="w-3.5 h-3.5 text-pink-500 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Graphic Poster Studio</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/services#mobile-approvals"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">WhatsApp 1-Tap Approvals</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <CreditCard className="w-3.5 h-3.5 text-sky-400 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Pricing Plans (₹)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Contact Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Solutions
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li>
                <Link
                  href="/services"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-primary shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Local Retail & Boutiques</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Clinics & Healthcare</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Gyms, Salons & Spas</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Creators & Influencers</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Marketing Agencies</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal Policies */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Trust & Legal
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <FileText className="w-3.5 h-3.5 text-primary shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <RefreshCcw className="w-3.5 h-3.5 text-primary shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Cancellation & Refunds</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">GST Tax Invoicing</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-all flex items-center gap-2.5 group"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Help & Contact Desk</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>{copyright}</p>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/refund-policy" className="hover:text-foreground transition-colors">
              Refund Policy
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
            <span className="text-muted-foreground/40 hidden sm:inline">|</span>
            <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
              Made for Indian Commerce
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
