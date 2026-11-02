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
      className={`sticky top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-xs text-foreground"
          : "bg-background/85 backdrop-blur-md border-b border-border/50 text-foreground"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between flex-nowrap gap-2">
        {/* Brand: Logo */}
        <Link
          href="/"
          className="flex items-center group cursor-pointer shrink-0"
          title="ABCD Social Hub"
        >
          <div className="relative h-8 sm:h-11 w-auto flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/logo_blue.png"
              alt="ABCD Social Hub Logo"
              width={180}
              height={44}
              className="h-8 sm:h-11 w-auto object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm sm:text-[15px] font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive
                    ? "text-primary font-bold"
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

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {authStatus === "loading" ? (
            <div className="h-9 w-28 rounded-xl bg-muted/40 animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs sm:text-sm font-bold transition-all shadow-md shadow-primary/20 active:scale-95 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {/* Circular profile avatar */}
              <Link
                href="/profile"
                title="Profile Settings"
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-border hover:border-primary overflow-hidden transition-all shadow-xs cursor-pointer flex items-center justify-center bg-card shrink-0"
              >
                <img
                  src={user?.image || "/avatars/default-avatar.svg"}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground px-3.5 py-2 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs sm:text-sm font-bold transition-all shadow-md shadow-primary/20 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Free Pilot</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile View: Strictly 1 Line (Dashboard ICON ONLY, Avatar, Menu Toggle) */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Dashboard Icon Button Only (No wide button text) */}
              <Link
                href="/dashboard"
                title="Dashboard"
                className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs active:scale-95 transition-transform"
              >
                <LayoutDashboard className="w-4 h-4" />
              </Link>
              {/* Circular Avatar */}
              <Link
                href="/profile"
                title="Profile Settings"
                className="w-8 h-8 rounded-full border border-border overflow-hidden flex items-center justify-center bg-card shrink-0"
              >
                <img
                  src={user?.image || "/avatars/default-avatar.svg"}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            aria-label="Toggle navigation menu"
            className="w-8 h-8 rounded-xl bg-card border border-border text-foreground hover:bg-muted flex items-center justify-center transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card/98 backdrop-blur-2xl px-5 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200 text-foreground">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-base font-semibold py-2 px-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open Full Dashboard</span>
                </Link>
                <Link
                  href="/profile"
                  className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center overflow-hidden shrink-0"
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
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs border border-border"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
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
