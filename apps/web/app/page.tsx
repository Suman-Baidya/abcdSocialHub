import Link from "next/link";
import { 
  Sparkles, 
  Smartphone, 
  Palette, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Twitter 
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#0A0D14] text-foreground overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#00F0FF]/15 to-transparent blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F0FF] to-sky-600 flex items-center justify-center font-bold text-black text-lg shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              A
            </div>
            <span className="font-semibold text-lg tracking-tight">ABCD Social Hub</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#posters" className="hover:text-foreground transition-colors">Regional Posters</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing (₹)</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium hover:text-foreground text-muted-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 rounded-lg bg-[#00F0FF] text-black text-sm font-semibold hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
            >
              Start Free Pilot
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-[#00F0FF]/30 text-xs font-medium text-[#00F0FF] mb-8 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Built for Indian Small Businesses & Creators</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Turn Raw Ideas into 30 Days of <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-slate-200 to-[#00F0FF] bg-clip-text text-transparent">
            Bengali & English Social Posts
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop struggling with Canva and generic AI slop. Generate pixel-perfect branded promotional posters, approve them in 1 tap from your phone, and publish automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#00F0FF] text-black font-semibold flex items-center justify-center gap-2 hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_25px_rgba(0,240,255,0.35)]"
          >
            <span>Create Your Brand Kit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#demo"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-panel text-foreground font-medium hover:bg-white/5 transition-colors border border-white/10"
          >
            Watch 2-Min Demo
          </a>
        </div>

        {/* Channels Supported Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
          <span>Official API Integrations:</span>
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Instagram className="w-4 h-4 text-pink-500" /> Instagram Business
          </div>
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Facebook className="w-4 h-4 text-blue-500" /> Facebook Pages
          </div>
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Linkedin className="w-4 h-4 text-sky-400" /> LinkedIn
          </div>
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Twitter className="w-4 h-4 text-zinc-300" /> X (Twitter)
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Engineered for Real Local Businesses</h2>
          <p className="text-muted-foreground">Every feature is designed so you never waste hours on marketing again.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Regional Poster Studio */}
          <div className="glass-card p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center mb-6">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Branded Poster Studio</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Native Bengali (*যুক্তাক্ষর*) and English typography rendered server-side. Burn your logo, phone number, and address footer onto every promotional creative in 0.4s.
            </p>
            <div className="text-xs text-[#00F0FF] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero broken font ligatures
            </div>
          </div>

          {/* Card 2: Mobile Magic Link */}
          <div className="glass-card p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Mobile Magic-Link Approval</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Never log into a dashboard from a laptop. Review drafts directly on your phone via secure WhatsApp or Email links and tap &quot;Approve&quot; in 5 seconds.
            </p>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero-password mobile review
            </div>
          </div>

          {/* Card 3: Anti-Slop Humanizer */}
          <div className="glass-card p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Turnitout Anti-Slop Filter</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Purges robotic AI words like &quot;delve&quot; and &quot;testament&quot;. Adapts copy natively to each network using tested hook and retention formulas.
            </p>
            <div className="text-xs text-purple-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 4-Platform custom formats
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 max-w-5xl mx-auto border-t border-white/5 text-center">
        <h2 className="text-3xl font-bold mb-4">Simple, Transparent India-First Pricing</h2>
        <p className="text-muted-foreground mb-12">Pay securely via UPI Autopay, Debit, or Credit Card. GST invoices provided.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Starter Tier */}
          <div className="glass-card p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Starter</div>
              <div className="text-3xl font-extrabold mb-1">₹999<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              <p className="text-xs text-muted-foreground mb-6">Ideal for single local shops & tutors.</p>
              
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Brand Workspace</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 20 Branded Posters / mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Facebook & Instagram Publish</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Mobile Magic-Link Approvals</li>
              </ul>
            </div>
            <Link href="/signup?plan=starter" className="w-full py-2.5 rounded-lg glass-panel text-center text-sm font-semibold hover:bg-white/10 transition-colors">
              Choose Starter
            </Link>
          </div>

          {/* Growth Tier (Recommended) */}
          <div className="glass-card p-8 rounded-2xl flex flex-col justify-between relative border-[#00F0FF]/40 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#00F0FF] text-black text-xs font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <div className="text-sm font-semibold text-[#00F0FF] uppercase tracking-wider mb-2">Growth Business</div>
              <div className="text-3xl font-extrabold mb-1">₹1,499<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              <p className="text-xs text-muted-foreground mb-6">For active clinics, salons, and gyms.</p>
              
              <ul className="space-y-3 text-sm text-foreground mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" /> 2 Workspaces / Brands</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" /> 50 Branded Posters / mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" /> 4-Platform Copy Multiplexer</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" /> WhatsApp Click-to-Chat Leads</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" /> Priority Worker Processing</li>
              </ul>
            </div>
            <Link href="/signup?plan=growth" className="w-full py-2.5 rounded-lg bg-[#00F0FF] text-black text-center text-sm font-semibold hover:bg-[#00F0FF]/90 transition-colors">
              Start 14-Day Pilot
            </Link>
          </div>

          {/* Agency Tier */}
          <div className="glass-card p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agency</div>
              <div className="text-3xl font-extrabold mb-1">₹2,499<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              <p className="text-xs text-muted-foreground mb-6">For local marketing consultants.</p>
              
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 5 Client Workspaces</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 150 Branded Posters / mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Multi-Brand Asset Ingest</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Client Mobile Approvals</li>
              </ul>
            </div>
            <Link href="/signup?plan=agency" className="w-full py-2.5 rounded-lg glass-panel text-center text-sm font-semibold hover:bg-white/10 transition-colors">
              Contact for Agency
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ABCD Social Hub (ABCD Digital Hub). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/security" className="hover:text-foreground">Security Safeguards</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
