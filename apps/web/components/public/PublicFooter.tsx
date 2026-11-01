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
  Phone,
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
  const email = general?.contactEmail || "support@abcd.social";
  const phone = general?.contactPhone || "+91 98300 12345";
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
              Autonomous social marketing & Bengali poster automation for regional businesses.
            </p>

            <div className="space-y-1 text-xs pt-1">
              <div className="flex items-center gap-2 text-foreground/80">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/80">
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{phone} (Mon–Sat, 10 AM–7 PM IST)</span>
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
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Autopilot Overview
                </Link>
              </li>
              <li>
                <Link href="/services#cairo-engine" className="hover:text-foreground transition-colors">
                  Regional Poster Studio
                </Link>
              </li>
              <li>
                <Link href="/services#mobile-approvals" className="hover:text-foreground transition-colors">
                  WhatsApp Approvals
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing & Plans (₹)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Solutions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/services" className="hover:text-foreground transition-colors">
                  Local Retail & Boutiques
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-foreground transition-colors">
                  Clinics & Healthcare
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-foreground transition-colors">
                  Gyms, Salons & Spas
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-foreground transition-colors">
                  Regional Agencies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Trust & Invoicing
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-foreground/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero-Exposure Tokens</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Strict Tenant Isolation</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Razorpay UPI Autopay</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>GST Tax Invoices</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>{copyright}</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Staff Portal
            </Link>
            <Link href="/register" className="hover:text-foreground transition-colors">
              Register Business
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-[11px] font-mono text-muted-foreground">
              Built for Indian Commerce
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
