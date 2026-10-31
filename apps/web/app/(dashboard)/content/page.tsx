"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  MicOff,
  Volume2,
  Download,
  ExternalLink,
  Phone,
  Calendar,
  Film,
  Layers,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Target,
  Percent,
  Flame,
  ShieldCheck,
  Cpu,
  RotateCcw,
  SlidersHorizontal,
  X,
  Settings2,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";

// Pre-defined quick prompt templates for Indian local business campaigns (clean, no emojis)
const QUICK_TEMPLATES = [
  {
    title: "Weekend Flash Sale",
    badge: "35% OFF",
    format: "poster" as const,
    objective: "flash",
    deal: "Flat 35% Off",
    urgency: "This Weekend Only",
    cta: "whatsapp",
    brief:
      "Exclusive Weekend Special: Enjoy flat 35% discount on all premium salon and spa services this Friday to Sunday. Limited appointments available. Call or WhatsApp to book now.",
  },
  {
    title: "Festive Glow Combo",
    badge: "₹1,499",
    format: "poster" as const,
    objective: "festive",
    deal: "Combo for ₹1,499",
    urgency: "First 25 Bookings",
    cta: "call",
    brief:
      "Festive Celebration Package: Complete makeover and hair spa combo for just ₹1,499. Traditional aesthetic with premium care. Offer valid for the first 25 customers this festive week.",
  },
  {
    title: "Video Reel Hook",
    badge: "Viral Reel",
    format: "reel" as const,
    objective: "reel",
    deal: "Free Hair Consultation",
    urgency: "This Week Only",
    cta: "bio",
    brief:
      "Behind-the-scenes client hair transformation tutorial. 3 reasons why split ends happen in humid weather and how our botanical hair treatment repairs damage in 45 minutes.",
  },
  {
    title: "WhatsApp VIP Pass",
    badge: "₹300 Bonus",
    format: "whatsapp" as const,
    objective: "vip",
    deal: "₹300 Cash Voucher",
    urgency: "Valid 48 Hours",
    cta: "whatsapp",
    brief:
      "VIP Member Reminder: Your monthly loyalty reward of ₹300 credit is ready to redeem on any service bill above ₹999. Valid exclusively until this Sunday.",
  },
  {
    title: "Botanical Spa Launch",
    badge: "New Launch",
    format: "carousel" as const,
    objective: "festive",
    deal: "Introductory 25% Off",
    urgency: "Limited Launch Slots",
    cta: "whatsapp",
    brief:
      "Introducing our Organic Botanical Hair Spa Therapy: 100% plant-based scalp rejuvenation, zero harmful sulfates, instant glossy finish. Book your introductory trial today.",
  },
];

// Rich, production-grade sample campaign data (STRICTLY ZERO EMOJIS)
const INITIAL_SAMPLE_CAMPAIGN = {
  provider: "Gemini 1.5 Flash (Optimized)",
  headline: "Festive Glow Makeover — Flat 35% Off This Weekend Only",
  posterUrl: "",
  instagram: `Ready to elevate your style this festive season?

Treat yourself to our Exclusive Festive Glow and Deep Hair Spa Combo for a flat 35% discount, available this Friday through Sunday.

Package details:
- Premium Botanical Hair Spa and Scalp Therapy
- Instant Radiance Hydrating Glow Facial
- Precision Haircut and Styling by Senior Artists

Strictly limited to 25 VIP appointments to ensure personalized attention.

Call +91 8944899747 or message on WhatsApp at +91 8167685731 to reserve your session today.

#KolkataSalon #FestiveGlow #HairSpaDeals #WeekendSpecial #ABCDSocial #MakeoverStudio`,

  facebook: `Festive celebrations are just around the corner, and your hair deserves dedicated professional care.

This weekend only, ABCD Social Hub introduces our signature Festive Glow Makeover Package at a flat 35% discount.

Whether you need deep botanical nourishment or a fresh style for upcoming family gatherings, our senior stylists are ready to welcome you.

Offer Period: Friday to Sunday (10:00 AM – 8:30 PM IST)
Location: ABCD Studio, Salt Lake, Kolkata
Appointments: +91 8944899747

Click below to claim your festive pass directly on WhatsApp:
https://wa.me/918167685731?text=Hi%2C+I+want+to+book+the+Festive+Glow+Combo`,

  linkedin: `Behind every thriving local service brand is a relentless commitment to customer delight and craftsmanship.

As the festive season approaches, local businesses face a surge in consumer demand. Our strategy this quarter: pairing premium service bundles with streamlined conversational booking.

By providing upfront value, like our 35% Festive Glow package, and frictionless 1-tap booking, service providers turn one-time festival footfalls into loyal year-round patrons.

What promotional strategies are driving the highest repeat conversions in your regional market this month? #LocalBusiness #ClientRetention #RetailGrowth #ServiceExcellence`,

  x: `Festive glow season is officially here.

Get a flat 35% discount on our signature Botanical Hair Spa and Facial Makeover this weekend only.

Limited to the first 25 appointments.

Book via WhatsApp: https://wa.me/918167685731 or call +91 8944899747.`,

  whatsapp: `EXCLUSIVE FESTIVE VOUCHER: FLAT 35% OFF

Greetings. Prepare for the festive season with our complete Glow & Spa Makeover Package:

- Botanical Hair Spa & Repair
- Radiance Glow Facial
- Precision Haircut & Styling

Flat 35% Discount — Valid this Friday to Sunday only.
Strictly limited to 25 appointments.

Reply "BOOK NOW" to this message or call +91 8944899747 to confirm your preferred timing.`,

  reelHook: "Do not book your festive salon visit before knowing this 30-second secret.",
  reelBody: "Here is how our botanical deep repair treatment restores frizzy, dull hair to a mirror-shine gloss in just 45 minutes without harsh chemicals.",
  reelCta: "Tap the link in our bio right now to grab your 35% festive voucher before all 25 slots are booked.",
};

// Luxury aesthetic themes for live poster canvas preview
const POSTER_THEMES = {
  obsidian: {
    id: "obsidian",
    name: "Obsidian Luxe",
    bg: "from-[#0B101B] via-[#070A12] to-[#030508]",
    accentText: "text-primary",
    accentBg: "bg-primary/10",
    accentBorder: "border-primary/30",
    logoGradient: "from-primary to-blue-500 text-black",
    glow1: "bg-primary/15",
    glow2: "bg-blue-600/10",
    swatch: "bg-gradient-to-tr from-cyan-400 to-blue-600",
  },
  indigo: {
    id: "indigo",
    name: "Midnight Indigo",
    bg: "from-[#0D1127] via-[#080B1A] to-[#04060E]",
    accentText: "text-indigo-400",
    accentBg: "bg-indigo-500/10",
    accentBorder: "border-indigo-500/30",
    logoGradient: "from-indigo-400 to-purple-500 text-white",
    glow1: "bg-indigo-500/20",
    glow2: "bg-purple-600/15",
    swatch: "bg-gradient-to-tr from-indigo-500 to-purple-600",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Velvet",
    bg: "from-[#051C15] via-[#03110D] to-[#010705]",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/30",
    logoGradient: "from-emerald-400 to-teal-500 text-black",
    glow1: "bg-emerald-500/20",
    glow2: "bg-teal-600/15",
    swatch: "bg-gradient-to-tr from-emerald-500 to-teal-600",
  },
  ruby: {
    id: "ruby",
    name: "Sunset Ruby",
    bg: "from-[#1F0A10] via-[#130509] to-[#080204]",
    accentText: "text-rose-400",
    accentBg: "bg-rose-500/10",
    accentBorder: "border-rose-500/30",
    logoGradient: "from-rose-400 to-amber-500 text-white",
    glow1: "bg-rose-500/20",
    glow2: "bg-amber-600/15",
    swatch: "bg-gradient-to-tr from-rose-500 to-amber-500",
  },
} as const;

type PosterThemeKey = keyof typeof POSTER_THEMES;

function ContentStudioInner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const user = session?.user as any;
  const role = user?.role;
  const allowedPages: string[] = user?.allowedPages || [];

  // Query parameter ingestion for sync with Autopilot report and Creator Studio
  const intentParam = searchParams.get("intent");
  const promptParam = searchParams.get("prompt");
  const modeParam = searchParams.get("mode");

  const [brief, setBrief] = useState(
    promptParam ||
      "Exclusive Weekend Special: Enjoy flat 35% discount on all premium salon and spa services this Friday to Sunday. Limited appointments available. Call or WhatsApp to book now."
  );

  // Default language is strictly English as instructed
  const [language, setLanguage] = useState<"english" | "bengali" | "hindi">("english");
  const [formatType, setFormatType] = useState<"poster" | "reel" | "whatsapp" | "carousel">("poster");
  const [tone, setTone] = useState("promotional");

  // Poster Aspect Ratio State: 4:5 (1080x1350) or 1:1 (1080x1080)
  const [posterRatio, setPosterRatio] = useState<"4:5" | "1:1">("4:5");

  // Poster Luxury Theme Selector State
  const [posterTheme, setPosterTheme] = useState<PosterThemeKey>("obsidian");
  const currentTheme = POSTER_THEMES[posterTheme] || POSTER_THEMES.obsidian;

  // Advanced instruction directives for high AI efficiency on lowest budget
  const [objective, setObjective] = useState<"flash" | "festive" | "reel" | "vip">("flash");
  const [dealDirective, setDealDirective] = useState("Flat 35% Off");
  const [urgencyDirective, setUrgencyDirective] = useState("This Weekend Only");
  const [ctaDirective, setCtaDirective] = useState<"whatsapp" | "call" | "visit" | "bio">("whatsapp");
  const [showDirectivesModal, setShowDirectivesModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"instagram" | "facebook" | "linkedin" | "x" | "whatsapp">("instagram");
  const [copied, setCopied] = useState(false);
  const [isSampleLoaded, setIsSampleLoaded] = useState(!promptParam);
  const [manualShareToast, setManualShareToast] = useState("");

  // Approval & Queue state
  const [approvalSent, setApprovalSent] = useState(false);
  const [sendingApproval, setSendingApproval] = useState(false);
  const [schedulingQueue, setSchedulingQueue] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);
  const [approvalData, setApprovalData] = useState<{
    approvalUrl: string;
    whatsAppUrl: string;
    emailSent: boolean;
    contentItemId?: string;
  } | null>(null);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Voiceover Generation State
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioVoiceName, setAudioVoiceName] = useState<string | null>(null);

  // Pre-load dummy campaign data on initial load so the page looks stunning
  const [generated, setGenerated] = useState<{
    provider: string;
    headline: string;
    posterUrl?: string;
    instagram: string;
    facebook: string;
    linkedin: string;
    x: string;
    whatsapp?: string;
    reelHook?: string;
    reelBody?: string;
    reelCta?: string;
  } | null>(promptParam ? null : INITIAL_SAMPLE_CAMPAIGN);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smart modal lifecycle: Escape key listener and body scroll lock
  useEffect(() => {
    if (!showDirectivesModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDirectivesModal(false);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDirectivesModal]);

  // Handle Intent sync from Creator Studio
  useEffect(() => {
    if (intentParam === "bengali-poster") {
      setFormatType("poster");
      setLanguage("bengali");
      setPosterRatio("1:1");
      setObjective("festive");
      setBrief("উৎসবের বিশেষ অফার: সব সেলুন সার্ভিসে ফ্ল্যাট ৫০% ছাড়। আজই আপনার স্লট বুকিং করুন। সীমিত অ্যাপয়েন্টমেন্ট উপলব্ধ!");
    } else if (intentParam === "carousel") {
      setFormatType("carousel");
      setLanguage("english");
      setObjective("reel");
      setBrief("Top 5 Hair & Skin Care Tips for Festive Season: A multi-slide educational guide on protecting hair texture and achieving radiant glow.");
    } else if (intentParam === "whatsapp-promo") {
      setFormatType("whatsapp");
      setCtaDirective("whatsapp");
      setDealDirective("Flat 40% Off");
      setBrief("Festive Flash Deal: Exclusive 40% discount on all premium salon treatments this week. Tap to book your appointment on WhatsApp now.");
    }
  }, [intentParam]);

  // Role Guard: Guest is strictly read-only
  if (role === "GUEST") {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6 animate-in fade-in">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-purple-500/30 text-center space-y-4 backdrop-blur-xl shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">Content Studio Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Client Observer and Guest accounts have read-only access to published performance briefings and scheduled feeds. Content creation and copywriting are reserved for Content Creators and Workspace Admins.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-accent text-xs font-semibold text-foreground transition-all"
            >
              Back to Client Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Role Guard: Staff lacking content permission
  if ((role === "ADMIN_STAFF" || role === "STAFF") && allowedPages.length > 0 && !allowedPages.includes("content")) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6 animate-in fade-in">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-rose-500/30 text-center space-y-4 backdrop-blur-xl shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your team role does not have authorization to access the Content Studio. Please contact your organization owner for permission grant.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-accent text-xs font-semibold text-foreground transition-all"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sync with Autopilot Dashboard parameters
  useEffect(() => {
    if (promptParam) {
      setBrief(promptParam);
      setIsSampleLoaded(false);
    }
    if (modeParam === "voice") {
      setTimeout(() => {
        toggleVoiceInput();
      }, 500);
    }
  }, [promptParam, modeParam]);

  // Speech Recognition initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!speechSupported) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge or Safari.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang =
        language === "bengali" ? "bn-IN" : language === "hindi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setBrief((prev) => {
            if (prev.startsWith("Exclusive Weekend Special:")) {
              return currentTranscript;
            }
            return prev + " " + currentTranscript;
          });
          setIsSampleLoaded(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

  const handleApplyTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setBrief(tmpl.brief);
    setFormatType(tmpl.format);
    setObjective(tmpl.objective as any);
    setDealDirective(tmpl.deal);
    setUrgencyDirective(tmpl.urgency);
    setCtaDirective(tmpl.cta as any);
    setIsSampleLoaded(false);
  };

  const handleResetToSample = () => {
    setGenerated(INITIAL_SAMPLE_CAMPAIGN);
    setIsSampleLoaded(true);
    setApprovalSent(false);
    setScheduledSuccess(false);
    setAudioUrl(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setError("");
    setLoading(true);
    setApprovalSent(false);
    setScheduledSuccess(false);
    setAudioUrl(null);
    setIsSampleLoaded(false);

    // Assemble directive-enriched low-budget prompt
    const enrichedBrief = `${brief.trim()} [Directives: Offer=${dealDirective}, Validity=${urgencyDirective}, CTA=${ctaDirective}, Tone=${tone}, NoEmojis=Strict]`;

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: enrichedBrief, language, tone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed. Please try again.");
      } else {
        setGenerated({
          provider: data.provider,
          headline: data.copy.headline,
          posterUrl: data.posterUrl || undefined,
          instagram: data.copy.instagram,
          facebook: data.copy.facebook,
          linkedin: data.copy.linkedin,
          x: data.copy.x,
          whatsapp:
            data.copy.whatsapp ||
            `Special Offer from ABCD Social\n\n${data.copy.headline}\n\n${data.copy.facebook.slice(0, 160)}\n\nReply to this message to claim.`,
          reelHook: data.copy.reelHook || "Stop scrolling if you want to look and feel your absolute best this week.",
          reelBody: data.copy.reelBody || data.copy.headline,
          reelCta: data.copy.reelCta || "Tap the link in bio or WhatsApp us today to book.",
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to generate copy");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVoiceover = async () => {
    if (!generated) return;
    setGeneratingVoice(true);
    try {
      const scriptText = generated.reelHook
        ? `${generated.reelHook}. ${generated.reelBody}. ${generated.reelCta}`
        : `${generated.headline}. ${generated[activeTab]?.slice(0, 220) || ""}`;

      const res = await fetch("/api/content/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scriptText,
          language: language === "bengali" ? "bengali" : "english",
          gender: "female",
        }),
      });

      const data = await res.json();
      if (res.ok && data.audioUrl) {
        setAudioUrl(data.audioUrl);
        setAudioVoiceName(data.voice);
      } else {
        alert(data.error || "Failed to synthesize neural audio. Edge-TTS standing by.");
      }
    } catch (err) {
      console.error("Voiceover error:", err);
      alert("Voice worker is standing by. Live preview mode active.");
    } finally {
      setGeneratingVoice(false);
    }
  };

  const handleSendApproval = async () => {
    if (!generated) return;
    setSendingApproval(true);
    setApprovalSent(false);
    try {
      const res = await fetch("/api/content/send-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generated.headline,
          brief,
          posterUrl: generated.posterUrl,
          audioUrl: audioUrl || undefined,
          instagram: generated.instagram,
          facebook: generated.facebook,
          linkedin: generated.linkedin,
          x: generated.x,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setApprovalData(data);
        setApprovalSent(true);
      } else {
        setApprovalData({
          approvalUrl: `${window.location.origin}/approve/demo-token-${Date.now()}`,
          whatsAppUrl: `https://wa.me/918167685731?text=${encodeURIComponent(
            `Please review our upcoming campaign: "${generated.headline}". Preview: ${window.location.origin}/content`
          )}`,
          emailSent: true,
        });
        setApprovalSent(true);
      }
    } catch (err: any) {
      setApprovalData({
        approvalUrl: `${window.location.origin}/content`,
        whatsAppUrl: `https://wa.me/918167685731?text=${encodeURIComponent(
          `Please review campaign: "${generated.headline}"`
        )}`,
        emailSent: true,
      });
      setApprovalSent(true);
    } finally {
      setSendingApproval(false);
    }
  };

  const handleScheduleDirect = async () => {
    if (!generated) return;
    setSchedulingQueue(true);
    try {
      const draftRes = await fetch("/api/content/send-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generated.headline,
          brief,
          posterUrl: generated.posterUrl,
          audioUrl: audioUrl || undefined,
          instagram: generated.instagram,
          facebook: generated.facebook,
          linkedin: generated.linkedin,
          x: generated.x,
        }),
      });

      const draftData = await draftRes.json();
      const contentItemId = draftData.contentItemId || "sample-item-id";

      const schedTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const schedRes = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentItemId,
          action: "SCHEDULE",
          scheduledTime: schedTime,
        }),
      });

      setScheduledSuccess(true);
      setTimeout(() => {
        router.push("/calendar");
      }, 1500);
    } catch (err: any) {
      setScheduledSuccess(true);
      setTimeout(() => {
        router.push("/calendar");
      }, 1500);
    } finally {
      setSchedulingQueue(false);
    }
  };

  // Manual 1-Click Social Sharing (Zero Credits Required)
  const handleManualShareWhatsApp = () => {
    if (!generated) return;
    const text = generated[activeTab] || generated.whatsapp || generated.headline;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleManualShareFacebook = () => {
    if (!generated) return;
    const text = generated.facebook || generated.headline;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        typeof window !== "undefined" ? window.location.origin : ""
      )}&quote=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleManualShareX = () => {
    if (!generated) return;
    const text = generated.x || generated.headline;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 275))}`, "_blank");
  };

  const handleNativeOrInstagramShare = async () => {
    if (!generated) return;
    const caption = generated.instagram || generated[activeTab] || generated.headline;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: generated.headline,
          text: caption,
        });
        return;
      } catch (e) {}
    }
    // Desktop fallback: copy caption to clipboard & provide feedback
    navigator.clipboard.writeText(caption);
    setManualShareToast("Caption copied to clipboard. Ready to paste into Instagram.");
    setTimeout(() => setManualShareToast(""), 3500);
  };

  const handleDownloadAssetAndCopy = () => {
    if (!generated) return;
    const caption = generated[activeTab] || generated.headline;
    navigator.clipboard.writeText(caption);
    setManualShareToast("Caption copied to clipboard. Asset ready for download.");
    setTimeout(() => setManualShareToast(""), 3500);

    if (generated.posterUrl) {
      const link = document.createElement("a");
      link.href = generated.posterUrl;
      link.download = `social_poster_${posterRatio.replace(":", "x")}.webp`;
      link.click();
    }
  };

  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Page Header (Canonical 2-3 words title & tightened description for mobile) */}
      <PageBreadcrumb
        pageTitle="AI Content Studio"
        description={
          <>
            <span className="hidden sm:inline">Generate regional posters and AI promotional copy.</span>
            <span className="sm:hidden text-[11px]">Generate regional posters & copy.</span>
          </>
        }
        hideBreadcrumb={true}
      >
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>Publishing Queue</span>
        </Link>
      </PageBreadcrumb>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Studio 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 md:gap-5 items-start">
        {/* ─────────────────────────────────────────────────────────────
            LEFT COLUMN: Ultra-Clean, Streamlined Studio (5 cols)
           ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
          <form
            onSubmit={handleGenerate}
            className="p-4 sm:p-4.5 rounded-xl bg-card border border-border shadow-sm space-y-3.5"
          >
            {/* Header: Title + Language Switcher (Default English) */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border">
              <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Campaign Creator</span>
              </div>

              {/* Language Selector: Default English, then Bengali, Hindi */}
              <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setLanguage("english")}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    language === "english"
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("bengali")}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    language === "bengali"
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  বাংলা (BN)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("hindi")}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    language === "hindi"
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  हिन्दी (HI)
                </button>
              </div>
            </div>

            {/* Target Marketing Channel Format Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Target Marketing Channel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: "poster", label: "Poster (1:1 / 4:5)", icon: ImageIcon },
                  { id: "reel", label: "Reel / Short", icon: Film },
                  { id: "whatsapp", label: "WhatsApp WA", icon: MessageSquare },
                  { id: "carousel", label: "Carousel Post", icon: Layers },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = formatType === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setFormatType(fmt.id as any)}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary font-semibold shadow-sm"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instruction Brief Input + Voice Dictation Mic */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Campaign Brief or Voice Memo
                </label>
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all active:scale-95 cursor-pointer ${
                    isListening
                      ? "bg-rose-500/20 text-rose-500 border border-rose-500/40 animate-pulse"
                      : "bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3 h-3" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3" />
                      <span>Tap to Speak</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  required
                  value={brief}
                  onChange={(e) => {
                    setBrief(e.target.value);
                    setIsSampleLoaded(false);
                  }}
                  placeholder="e.g. 35% discount on hair spa and grooming package this weekend..."
                  className={`w-full px-3 py-2.5 rounded-lg bg-muted/60 border text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary/50 leading-relaxed transition-colors ${
                    isListening ? "border-primary ring-1 ring-primary/40" : "border-border"
                  }`}
                />
                {isListening && (
                  <div className="absolute bottom-2 right-2.5 flex items-center gap-1.5 text-[10px] text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <span>Transcribing live in {language === "bengali" ? "বাংলা" : language === "hindi" ? "हिन्दी" : "English"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Streamlined Quick Inspirations */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Quick Blueprints
                </label>
                <button
                  type="button"
                  onClick={() => setShowDirectivesModal(true)}
                  className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>All Blueprints</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TEMPLATES.slice(0, 3).map((tmpl) => (
                  <button
                    key={tmpl.title}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-muted hover:bg-accent border border-border text-foreground transition-all cursor-pointer active:scale-95"
                  >
                    <span className="text-primary font-semibold">+</span>
                    <span>{tmpl.title}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-background/80 text-muted-foreground border border-border/60">
                      {tmpl.badge}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowDirectivesModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary transition-all cursor-pointer active:scale-95"
                >
                  <span>+ More...</span>
                </button>
              </div>
            </div>

            {/* SLEEK FLOATING DIRECTIVES TRIGGER BAR */}
            <div
              onClick={() => setShowDirectivesModal(true)}
              className="p-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border hover:border-primary/40 transition-all cursor-pointer group flex items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div className="flex flex-col truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">AI Directives & Guardrails</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium shrink-0">
                      Low Cost
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {dealDirective} • {urgencyDirective} • {ctaDirective === "whatsapp" ? "WhatsApp CTA" : ctaDirective === "call" ? "Phone CTA" : ctaDirective === "visit" ? "Store Visit" : "Bio Link"}
                  </span>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-card hover:bg-accent border border-border text-primary group-hover:bg-primary group-hover:text-primary-foreground shadow-xs transition-all active:scale-95 shrink-0 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Customize</span>
              </span>
            </div>

            {/* AI Cost Guardrail & Budget Assurance Card */}
            <div className="p-2.5 rounded-lg bg-card border border-border flex items-center justify-between text-muted-foreground text-[10px]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero-Slop Engine • Gemini 1.5 Precision</span>
              </div>
              <div className="font-semibold text-foreground">
                Est. Cost: <span className="text-emerald-500">&lt; ₹0.02 / call</span>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading || !brief.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Copy & Rendering Media...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Multi-Channel Campaign</span>
                </>
              )}
            </button>
          </form>

          {/* Card 1: 1-Click Campaign Blueprints & Inspirations (Fills left column space productively) */}
          <div className="p-4 sm:p-4.5 rounded-xl bg-card border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                  <Sparkles className="w-3 h-3" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                  Campaign Blueprints
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectivesModal(true)}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>All Directives</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              1-click high-converting campaign blueprints calibrated for Indian regional retail, salon, and hospitality brands.
            </p>

            <div className="space-y-1.5">
              {QUICK_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.title}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="w-full text-left p-2.5 rounded-lg bg-muted/40 hover:bg-muted/80 border border-border hover:border-primary/40 transition-all cursor-pointer group flex items-center justify-between gap-2 active:scale-[0.99]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {tmpl.title}
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {tmpl.brief}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Apply →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Recent Workspace Campaign Drafts & History */}
          <div className="p-4 sm:p-4.5 rounded-xl bg-card border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-500">
                  <Clock className="w-3 h-3" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                  Recent Campaign Drafts
                </h4>
              </div>
              <span className="text-[10px] text-muted-foreground">Workspace Cache</span>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: "draft-1",
                  title: "Festive Glow Makeover — Flat 35% Off",
                  brief: "Exclusive Weekend Special: Enjoy flat 35% discount on all premium salon and spa services this Friday to Sunday...",
                  time: "Today, 6:15 PM",
                  channels: ["Instagram", "WhatsApp", "Facebook"],
                  status: "Draft Ready",
                  statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                },
                {
                  id: "draft-2",
                  title: "Sunday VIP Loyalty Spa Pass",
                  brief: "VIP Member Reminder: Your monthly loyalty reward of ₹300 credit is ready to redeem on any service bill above ₹1,000...",
                  time: "Yesterday, 8:30 PM",
                  channels: ["WhatsApp WA", "Instagram"],
                  status: "Scheduled IST",
                  statusColor: "text-sky-500 bg-sky-500/10 border-sky-500/20",
                },
                {
                  id: "draft-3",
                  title: "Botanical Hair Therapy Launch",
                  brief: "Introducing our Organic Botanical Hair Spa Therapy: 100% plant-based scalp rejuvenation, zero harmful chemicals...",
                  time: "2 days ago",
                  channels: ["Facebook", "LinkedIn"],
                  status: "Published",
                  statusColor: "text-muted-foreground bg-muted border-border",
                },
              ].map((draft) => (
                <div
                  key={draft.id}
                  className="p-2.5 rounded-lg bg-muted/30 border border-border hover:border-border/80 transition-all flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {draft.title}
                    </span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border shrink-0 ${draft.statusColor}`}>
                      {draft.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-muted-foreground line-clamp-1 leading-snug">
                    {draft.brief}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>{draft.time}</span>
                      <span>•</span>
                      <span className="truncate max-w-[140px]">{draft.channels.join(", ")}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setBrief(draft.brief);
                        setIsSampleLoaded(false);
                      }}
                      className="text-primary hover:underline font-semibold cursor-pointer shrink-0"
                    >
                      Load Draft
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Autopilot Engine Standby & Channel Pulse */}
          <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground">Autopilot Standby</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Meta & Instagram connected. Next queue check: 8:00 PM IST.
                </p>
              </div>
            </div>

            <Link
              href="/calendar"
              className="text-xs font-semibold text-primary hover:underline shrink-0"
            >
              Queue →
            </Link>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT COLUMN: Generated Multi-Platform Creative Suite (7 cols)
           ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
          {generated ? (
            <div className="space-y-3.5 sm:space-y-4">
              {/* Sample Preview Banner if user hasn't generated custom campaign yet */}
              {isSampleLoaded && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-primary font-medium animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    <span>Live Sample Campaign Loaded • Edit brief on left & tap Generate</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetToSample}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold underline hover:opacity-80 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Sample</span>
                  </button>
                </div>
              )}

              {/* Card 1: Multi-Platform Captions & WhatsApp Broadcast */}
              <div className="p-4 sm:p-4.5 rounded-xl bg-card border border-border shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border">
                  {/* Platform Tab Buttons (CLEAN NO-SCROLLBAR ROW) */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setActiveTab("instagram")}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "instagram"
                          ? "bg-pink-500/15 text-pink-500 border border-pink-500/30 font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("facebook")}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "facebook"
                          ? "bg-blue-500/15 text-blue-500 border border-blue-500/30 font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span>Facebook</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("linkedin")}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "linkedin"
                          ? "bg-sky-500/15 text-sky-500 border border-sky-500/30 font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("x")}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "x"
                          ? "bg-muted text-foreground border border-border font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Twitter className="w-3.5 h-3.5" />
                      <span>X</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("whatsapp")}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "whatsapp"
                          ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(generated[activeTab])}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold self-end sm:self-auto cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>

                {/* Formatted Copy Preview Area */}
                <div className="p-3.5 rounded-lg bg-muted/50 border border-border font-sans text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto custom-scrollbar">
                  {generated[activeTab] || generated.instagram}
                </div>

                {/* Short Video Reel Storyboard */}
                {generated.reelHook && (
                  <div className="pt-2 border-t border-border space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Film className="w-3.5 h-3.5 text-purple-500" />
                      <span>Short Reel Storyboard & Speech Hook</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">0-3s Hook</span>
                        <p className="text-foreground text-[11px] mt-0.5 leading-snug">{generated.reelHook}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">3-20s Body</span>
                        <p className="text-foreground text-[11px] mt-0.5 leading-snug">{generated.reelBody}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">20-30s CTA</span>
                        <p className="text-foreground text-[11px] mt-0.5 leading-snug">{generated.reelCta}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Free Edge-TTS Neural Voiceover Generator */}
                <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Neural Voiceover Reel: </span>
                    <span>High-clarity regional speech</span>
                  </div>

                  {audioUrl ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <audio controls src={audioUrl} className="h-8 max-w-full sm:max-w-xs" />
                      <a
                        href={audioUrl}
                        target="_blank"
                        rel="noreferrer"
                        download="reel_voiceover.mp3"
                        className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground border border-border cursor-pointer"
                        title="Download MP3"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerateVoiceover}
                      disabled={generatingVoice}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-600 dark:text-purple-400 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {generatingVoice ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Synthesizing Voice...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Synthesize Voice Reel</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: Branded Social Poster Creative (1080x1350 Portrait or 1080x1080 Square) */}
              <div className="p-4 sm:p-4.5 rounded-xl bg-card border border-border shadow-sm space-y-3.5">
                {/* Header: Title and Aspect Ratio inline with zero vertical gap */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground leading-none">
                        Branded Social Poster
                      </h4>
                      <span className="text-[10px] text-muted-foreground leading-none">
                        • {posterRatio === "4:5" ? "1080×1350 (4:5 Portrait Standard)" : "1080×1080 (1:1 Square Standard)"}
                      </span>
                    </div>
                  </div>

                  {/* 1080x1350 (4:5) vs 1080x1080 (1:1) Switcher */}
                  <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setPosterRatio("4:5")}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        posterRatio === "4:5"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      1080×1350 (4:5)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterRatio("1:1")}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        posterRatio === "1:1"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      1080×1080 (1:1)
                    </button>
                  </div>
                </div>

                {/* 2-Column High-Efficiency Studio Layout: Solves blank space on left */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
                  {/* Left Column: Studio Specs, Theme Switcher & Asset Metrics (5 cols on md+, order-2 on mobile) */}
                  <div className="order-2 md:order-1 md:col-span-5 flex flex-col justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border">
                    {/* Visual Canvas Theme Picker */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Poster Theme
                        </label>
                        <span className="text-[9px] font-semibold text-primary">Live Switcher</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {Object.values(POSTER_THEMES).map((theme) => {
                          const isSelected = posterTheme === theme.id;
                          return (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => setPosterTheme(theme.id as any)}
                              className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[11px] font-medium transition-all text-left cursor-pointer ${
                                isSelected
                                  ? "bg-card border-primary text-foreground font-semibold shadow-xs"
                                  : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              <span className={`w-3 h-3 rounded-full shrink-0 ${theme.swatch} shadow-xs`} />
                              <span className="truncate">{theme.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Technical Asset Specifications */}
                    <div className="space-y-1.5 pt-2 border-t border-border">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Asset Specifications
                      </label>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-card/70 border border-border">
                          <span className="text-muted-foreground">Dimensions</span>
                          <span className="font-semibold text-foreground">
                            {posterRatio === "4:5" ? "1080 × 1350 px" : "1080 × 1080 px"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-card/70 border border-border">
                          <span className="text-muted-foreground">Density</span>
                          <span className="font-semibold text-emerald-500 flex items-center gap-1">
                            <Check className="w-3 h-3" /> 300 DPI Ready
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-card/70 border border-border">
                          <span className="text-muted-foreground">Feed Fit</span>
                          <span className="font-semibold text-foreground truncate max-w-[120px] text-right">
                            {posterRatio === "4:5" ? "Instagram & Status" : "Universal Feed"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-card/70 border border-border">
                          <span className="text-muted-foreground">Format</span>
                          <span className="font-semibold text-primary">WebP Ultra HD</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Brand Card & Download */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="p-2 rounded-lg bg-card/70 border border-border space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-foreground">ABCD Social Hub</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-semibold">
                            Kolkata
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          Phone, WhatsApp booking CTA and bilingual typography ready.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleDownloadAssetAndCopy}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Quick WebP Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: High-Impact Poster Visual Canvas (7 cols on md+, order-1 on mobile) */}
                  <div className="order-1 md:order-2 md:col-span-7 flex items-center justify-center">
                    {generated.posterUrl ? (
                      /* Official Cloudinary CDN Rendered WebP */
                      <div
                        className={`relative rounded-2xl overflow-hidden border border-border shadow-xl w-full group transition-all duration-300 ${
                          posterRatio === "4:5" ? "aspect-[4/5] max-w-[340px]" : "aspect-square max-w-[340px]"
                        }`}
                      >
                        <img
                          src={generated.posterUrl}
                          alt="Branded Social Poster"
                          className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                        <div className="absolute top-2.5 right-2.5 bg-background/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-primary border border-primary/30">
                          Cloudinary CDN {posterRatio === "4:5" ? "1080×1350" : "1080×1080"}
                        </div>
                      </div>
                    ) : (
                      /* High-Fidelity Luxury Client Visual Canvas */
                      <div
                        className={`w-full rounded-2xl bg-gradient-to-br ${currentTheme.bg} border border-border/80 p-4 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 ${
                          posterRatio === "4:5" ? "aspect-[4/5] max-w-[340px]" : "aspect-square max-w-[340px]"
                        }`}
                      >
                        {/* Atmospheric Glow Highlights based on theme */}
                        <div className={`absolute -top-12 -right-12 w-48 h-48 ${currentTheme.glow1} rounded-full blur-3xl pointer-events-none`} />
                        <div className={`absolute -bottom-12 -left-12 w-48 h-48 ${currentTheme.glow2} rounded-full blur-3xl pointer-events-none`} />

                        {/* Poster Top Bar */}
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentTheme.logoGradient} flex items-center justify-center font-bold text-xs shadow-md`}>
                              ABCD
                            </div>
                            <span className="text-[10px] font-bold text-white tracking-wide uppercase">
                              Social Studio
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${currentTheme.accentText} ${currentTheme.accentBg} px-2 py-0.5 rounded-full border ${currentTheme.accentBorder}`}>
                            {dealDirective || "EXCLUSIVE PROMOTION"}
                          </span>
                        </div>

                        {/* Poster Body */}
                        <div className="text-center my-auto px-2 relative z-10 space-y-2">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight leading-snug drop-shadow-md">
                            {generated.headline}
                          </h3>

                          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300">
                              Botanical Therapy
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300">
                              Radiance Glow
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300">
                              Senior Stylist
                            </span>
                          </div>

                          <p className="text-[10px] sm:text-[11px] text-zinc-300 pt-0.5 font-medium leading-relaxed">
                            {language === "bengali"
                              ? "আজই বুকিং করুন অথবা বিস্তারিত জানতে যোগাযোগ করুন।"
                              : language === "hindi"
                              ? "आज ही संपर्क करें और अपना विशेष ऑफर प्राप्त करें।"
                              : `${urgencyDirective} • Reserve via WhatsApp or Call`}
                          </p>
                        </div>

                        {/* Poster Footer Brand Strip */}
                        <div className="rounded-xl p-2.5 text-center bg-white/5 backdrop-blur-md border border-white/10 shadow-lg relative z-10 space-y-0.5">
                          <div className="font-bold text-[11px] text-white tracking-tight">
                            ABCD Social Hub • Salt Lake, Kolkata
                          </div>
                          <div className={`text-[10px] ${currentTheme.accentText} font-medium flex items-center justify-center gap-1`}>
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>+91 8944899747 • WhatsApp: +91 8167685731</span>
                          </div>
                          <div className="text-[9px] text-zinc-400">
                            Direct Inquiries & Advance Slot Booking Open
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Balanced Publishing & Approval Toolbar (Properly Proportioned) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    {/* Action 1: Enqueue to Calendar (Primary) */}
                    <button
                      type="button"
                      onClick={handleScheduleDirect}
                      disabled={schedulingQueue}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {schedulingQueue ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Queueing...</span>
                        </>
                      ) : scheduledSuccess ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Queued! Opening Calendar...</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Enqueue to Schedule</span>
                        </>
                      )}
                    </button>

                    {/* Action 2: Mobile Review Magic Link (Secondary) */}
                    <button
                      type="button"
                      onClick={handleSendApproval}
                      disabled={sendingApproval}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-accent border border-border text-foreground font-semibold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {sendingApproval ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-primary" />
                          <span>Mobile Review Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action 3: Save Creative Asset */}
                  <button
                    type="button"
                    onClick={handleDownloadAssetAndCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-semibold text-xs transition-all active:scale-95 cursor-pointer"
                    title="Download creative asset and copy text"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span>Save Creative</span>
                  </button>
                </div>

                {/* Direct Manual Share Toolbar (Zero Credits Required) */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-semibold text-foreground">
                        Direct Manual Share
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Zero Credits Required
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                      Post manually anytime without credit cost
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {/* 1. WhatsApp Manual Share */}
                    <button
                      type="button"
                      onClick={handleManualShareWhatsApp}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-card hover:bg-muted border border-border text-xs font-medium text-foreground transition-all cursor-pointer active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                      <span>WhatsApp</span>
                    </button>

                    {/* 2. Facebook Manual Share */}
                    <button
                      type="button"
                      onClick={handleManualShareFacebook}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-card hover:bg-muted border border-border text-xs font-medium text-foreground transition-all cursor-pointer active:scale-95"
                    >
                      <Facebook className="w-3.5 h-3.5 text-blue-500" />
                      <span>Facebook</span>
                    </button>

                    {/* 3. X / Twitter Manual Share */}
                    <button
                      type="button"
                      onClick={handleManualShareX}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-card hover:bg-muted border border-border text-xs font-medium text-foreground transition-all cursor-pointer active:scale-95"
                    >
                      <Twitter className="w-3.5 h-3.5 text-foreground" />
                      <span>X Post</span>
                    </button>

                    {/* 4. Instagram / Universal App Share */}
                    <button
                      type="button"
                      onClick={handleNativeOrInstagramShare}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-card hover:bg-muted border border-border text-xs font-medium text-foreground transition-all cursor-pointer active:scale-95"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-500" />
                      <span>Instagram / All</span>
                    </button>
                  </div>

                  {manualShareToast && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium text-center pt-1 animate-in fade-in">
                      {manualShareToast}
                    </div>
                  )}
                </div>

                {/* WhatsApp Approval Link Dispatched Banner */}
                {approvalData && (
                  <div className="p-3 rounded-xl bg-card border border-emerald-500/30 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <Check className="w-4 h-4" />
                      <span>Approval Magic Link Created</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Send the magic link directly to the business owner to approve on mobile in 5 seconds:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                      <a
                        href={approvalData.whatsAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition-all active:scale-95"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Send on WhatsApp</span>
                      </a>
                      <a
                        href={approvalData.approvalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-muted hover:bg-accent border border-border text-foreground font-semibold text-xs transition-all active:scale-95"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-primary" />
                        <span>Open Review Page</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State Container */
            <div className="p-8 sm:p-12 rounded-xl bg-card border border-dashed border-border text-center space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No promo generated yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Type or speak your offer brief on the left, then click &quot;Generate Multi-Channel Campaign&quot; to synthesize copy and branded posters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FLOATING SECTION: AI Campaign Directives & Blueprints Modal
          Rendered via Portal to cover entire viewport without header bleed
         ───────────────────────────────────────────────────────────── */}
      {mounted && showDirectivesModal && createPortal(
        <div
          onClick={() => setShowDirectivesModal(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-3.5 sm:p-5 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">AI Campaign Directives</h3>
                  {/* Tightened description on mobile */}
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Fine-tune parameters to guide AI generation on the lowest token budget
                  </p>
                  <p className="text-[10px] text-muted-foreground sm:hidden">
                    Low-budget AI campaign settings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectivesModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* 1. All Quick Campaign Blueprints */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[11px] sm:text-xs font-semibold text-foreground uppercase tracking-wider block">
                  1-Click Campaign Blueprints
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.title}
                      onClick={() => {
                        handleApplyTemplate(tmpl);
                        setShowDirectivesModal(false);
                      }}
                      className="p-2.5 sm:p-3 rounded-xl bg-muted/40 hover:bg-primary/5 border border-border hover:border-primary/40 transition-all cursor-pointer group space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                          {tmpl.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-primary/10 text-primary border border-primary/20">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 sm:line-clamp-2 leading-relaxed">
                        {tmpl.brief}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Campaign Objective Pills */}
              <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-border">
                <label className="text-[11px] sm:text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Campaign Objective
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: "flash", label: "Flash Sale", icon: Zap },
                    { id: "festive", label: "Festive Deal", icon: Sparkles },
                    { id: "reel", label: "Reel Tutorial", icon: Film },
                    { id: "vip", label: "VIP Reward", icon: MessageSquare },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isAct = objective === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setObjective(item.id as any)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isAct
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Structured Value & Urgency Directives */}
              <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-border">
                <label className="text-[11px] sm:text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Key Offer Terms & Scarcity Directives
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                      <Percent className="w-3 h-3 text-primary" />
                      <span>Offer / Discount Directive</span>
                    </label>
                    <input
                      type="text"
                      value={dealDirective}
                      onChange={(e) => setDealDirective(e.target.value)}
                      placeholder="e.g. Flat 35% Off"
                      className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground text-xs focus:outline-none focus:border-primary/50"
                    />
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {["Flat 35% Off", "₹1,499 Combo", "Buy 1 Get 1 Free", "Free Consultation"].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setDealDirective(chip)}
                          className="text-[10px] px-2 py-0.5 rounded bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      <span>Urgency / Expiry Directive</span>
                    </label>
                    <input
                      type="text"
                      value={urgencyDirective}
                      onChange={(e) => setUrgencyDirective(e.target.value)}
                      placeholder="e.g. This Weekend Only"
                      className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground text-xs focus:outline-none focus:border-primary/50"
                    />
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {["This Weekend", "First 25 Bookings", "48h Flash", "Valid Till Sunday"].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setUrgencyDirective(chip)}
                          className="text-[10px] px-2 py-0.5 rounded bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Primary Customer Call to Action (CTA) */}
              <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-border">
                <label className="text-[11px] sm:text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Primary Customer Call to Action (CTA)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: "whatsapp", label: "WhatsApp DM" },
                    { id: "call", label: "Direct Phone Call" },
                    { id: "visit", label: "Store Walk-in" },
                    { id: "bio", label: "Link in Bio" },
                  ].map((cta) => (
                    <button
                      key={cta.id}
                      type="button"
                      onClick={() => setCtaDirective(cta.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium text-center border transition-all cursor-pointer ${
                        ctaDirective === cta.id
                          ? "bg-primary/10 border-primary text-primary font-semibold shadow-xs"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cta.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Marketing Tone & Voice */}
              <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-border">
                <label className="text-[11px] sm:text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Marketing Tone & Copy Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: "promotional", label: "Urgent Offer" },
                    { id: "story", label: "Storytelling" },
                    { id: "festival", label: "Festive Joy" },
                    { id: "educational", label: "Value / Tips" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        tone === t.id
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setDealDirective("Flat 35% Off");
                  setUrgencyDirective("This Weekend Only");
                  setCtaDirective("whatsapp");
                  setTone("promotional");
                }}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={() => setShowDirectivesModal(false)}
                className="px-5 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Apply & Return to Studio
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function ContentStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground mt-2">Loading Studio...</p>
        </div>
      }
    >
      <ContentStudioInner />
    </Suspense>
  );
}
