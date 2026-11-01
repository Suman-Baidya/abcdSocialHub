"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Menu,
  X,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

interface PublicNavbarProps {
  brandName?: string;
}

export function PublicNavbar({ brandName = "ABCD Social Hub" }: PublicNavbarProps) {
  const pathname = usePathname();
  const { data: session, status: authStatus } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
  ];

  const user = session?.user as any;
  const isAuthenticated = authStatus === "authenticated" && !!session;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-md shadow-black/10"
          : "bg-background/80 backdrop-blur-md border-b border-border/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand: ONLY logo_blue.png (Zero additional text) */}
        <Link
          href="/"
          className="flex items-center group cursor-pointer"
          title="ABCD Social Hub"
        >
          <div className="relative h-8 sm:h-9 w-auto flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/logo_blue.png"
              alt="ABCD Social Hub Logo"
              width={160}
              height={40}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Controls: "Dashboard" + Circular Profile Picture (No text name) */}
        <div className="hidden md:flex items-center gap-2.5">
          {authStatus === "loading" ? (
            <div className="h-8 w-24 rounded-xl bg-muted/40 animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-primary/20 active:scale-95 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              {/* Circular profile avatar picture */}
              <Link
                href="/profile"
                title="Profile Settings"
                className="relative w-8 h-8 rounded-full border border-border hover:border-primary overflow-hidden transition-all shadow-xs cursor-pointer flex items-center justify-center bg-card shrink-0"
              >
                <img
                  src={user?.image || "/avatars/default-avatar.svg"}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-primary/20 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Free Pilot</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile View: Dashboard + Profile Circle + Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && (
            <div className="flex items-center gap-1.5">
              <Link
                href="/dashboard"
                className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/profile"
                className="w-7 h-7 rounded-full border border-border overflow-hidden flex items-center justify-center bg-card shrink-0"
              >
                <img
                  src={user?.image || "/avatars/default-avatar.svg"}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            aria-label="Toggle navigation menu"
            className="p-1.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card/95 backdrop-blur-2xl px-5 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium py-1.5 px-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center overflow-hidden shrink-0"
                >
                  <img
                    src={user?.image || "/avatars/default-avatar.svg"}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium text-xs border border-border"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Free Pilot</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
