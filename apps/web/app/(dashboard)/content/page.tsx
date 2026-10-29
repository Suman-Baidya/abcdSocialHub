"use client";

import { useState, useEffect, useRef } from "react";
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
  Image as ImageIcon,
  Mic,
  MicOff,
  Volume2,
  Download,
  ExternalLink,
  Play,
  RotateCcw,
  Phone,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";

export default function ContentStudioPage() {
  const [brief, setBrief] = useState(
    "Weekend Special Offer: 40% discount on all salon grooming services this Friday to Sunday! Limited slots available."
  );
  const [language, setLanguage] = useState<"bengali" | "english">("bengali");
  const [tone, setTone] = useState("promotional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"instagram" | "facebook" | "linkedin" | "x">("instagram");
  const [copied, setCopied] = useState(false);
  const [approvalSent, setApprovalSent] = useState(false);
  const [sendingApproval, setSendingApproval] = useState(false);
  const [approvalData, setApprovalData] = useState<{
    approvalUrl: string;
    whatsAppUrl: string;
    emailSent: boolean;
  } | null>(null);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Voiceover Generation State
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioVoiceName, setAudioVoiceName] = useState<string | null>(null);

  const [generated, setGenerated] = useState<{
    provider: string;
    headline: string;
    posterUrl?: string;
    instagram: string;
    facebook: string;
    linkedin: string;
    x: string;
  } | null>(null);

  // Initialize Speech Recognition
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
      alert("Voice input is not supported in this browser. Please use Chrome or Safari.");
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
      recognition.lang = language === "bengali" ? "bn-IN" : "en-IN";

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
            // If previous was the default sample, replace it cleanly
            if (prev.startsWith("Weekend Special Offer:")) {
              return currentTranscript;
            }
            return prev + " " + currentTranscript;
          });
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setError("");
    setLoading(true);
    setApprovalSent(false);
    setAudioUrl(null);

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, language, tone }),
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
      // Create script from headline and active channel copy
      const scriptText = `${generated.headline}. ${generated[activeTab].slice(0, 220)}`;
      const res = await fetch("/api/content/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scriptText,
          language: language,
          gender: "female",
        }),
      });

      const data = await res.json();
      if (res.ok && data.audioUrl) {
        setAudioUrl(data.audioUrl);
        setAudioVoiceName(data.voice);
      } else {
        alert(data.error || "Failed to synthesize neural audio");
      }
    } catch (err) {
      console.error("Voiceover error:", err);
      alert("Failed to connect to voice worker");
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
        alert(data.error || "Failed to dispatch approval");
      }
    } catch (err: any) {
      alert("Error sending approval: " + (err?.message || "Network issue"));
    } finally {
      setSendingApproval(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <PageBreadcrumb pageTitle="AI Content Studio" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#00F0FF]" />
            <span>AI Content Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Voice-to-copy generator with Bengali/English 1080×1080 poster rendering and zero-cost audio reels.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Brief Input (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleGenerate}
            className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                <span>Input Promotional Brief</span>
              </div>

              {/* Language Switcher Pill */}
              <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setLanguage("bengali")}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                    language === "bengali"
                      ? "bg-[#00F0FF] text-[#0A0D14]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  বাংলা (BN)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("english")}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                    language === "english"
                      ? "bg-[#00F0FF] text-[#0A0D14]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            {/* Voice Assistant Mic Button & Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Describe Offer or Speak
                </label>
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                    isListening
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                      : "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25 hover:bg-[#00F0FF]/20"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Listening... Tap Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
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
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="e.g. 50% discount on hair spa this weekend for Durga Puja..."
                  className={`w-full px-3.5 py-3 rounded-xl bg-zinc-900/90 border text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-[#00F0FF] leading-relaxed transition-colors ${
                    isListening ? "border-[#00F0FF] ring-1 ring-[#00F0FF]/40" : "border-white/[0.08]"
                  }`}
                />
                {isListening && (
                  <div className="absolute bottom-2.5 right-3 flex items-center gap-1 text-[11px] text-[#00F0FF]">
                    <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
                    <span>Transcribing live in {language === "bengali" ? "বাংলা" : "English"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Copy Tone
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "promotional", label: "Urgent Offer" },
                  { id: "story", label: "Customer Story" },
                  { id: "festival", label: "Festive Joy" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                      tone === t.id
                        ? "border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF]"
                        : "border-white/[0.06] bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading || !brief.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00D4E0] to-[#00F0FF] hover:opacity-95 text-[#0A0D14] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00F0FF]/20 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Copy & Rendering Poster...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate 4-Platform Copy & Poster</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Multi-Channel Output + Poster + Audio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {generated ? (
            <div className="space-y-6">
              {/* Channel Tabs */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  {/* Platform Tab Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setActiveTab("instagram")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        activeTab === "instagram"
                          ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("facebook")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        activeTab === "facebook"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span>Facebook</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("linkedin")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        activeTab === "linkedin"
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("x")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        activeTab === "x"
                          ? "bg-zinc-800 text-white border border-zinc-700"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Twitter className="w-3.5 h-3.5" />
                      <span>X</span>
                    </button>
                  </div>

                  <button
                    onClick={() => copyToClipboard(generated[activeTab])}
                    className="flex items-center gap-1.5 text-xs text-[#00F0FF] hover:underline font-medium self-end sm:self-auto"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-white/[0.04] font-sans text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {generated[activeTab]}
                </div>

                {/* Free Neural Voiceover Reel Generator */}
                <div className="pt-2 border-t border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400">
                    <span className="font-medium text-zinc-300">Free Neural Reel Audio: </span>
                    <span>Edge-TTS high-clarity speech</span>
                  </div>

                  {audioUrl ? (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <audio controls src={audioUrl} className="h-8 max-w-full sm:max-w-xs" />
                      <a
                        href={audioUrl}
                        target="_blank"
                        rel="noreferrer"
                        download="reel_voiceover.mp3"
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                        title="Download MP3"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerateVoiceover}
                      disabled={generatingVoice}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
                    >
                      {generatingVoice ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Synthesizing Voice...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Generate Neural Audio Reel</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Branded Poster Preview Card (Cloudinary Render or Live Fallback) */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-100 font-semibold text-xs sm:text-sm">
                    <ImageIcon className="w-4 h-4 text-[#00F0FF]" />
                    <span>Branded 1080×1080 Poster Creative</span>
                  </div>
                  {generated.posterUrl && (
                    <a
                      href={generated.posterUrl}
                      target="_blank"
                      rel="noreferrer"
                      download="social_poster.webp"
                      className="inline-flex items-center gap-1 text-[11px] text-[#00F0FF] hover:underline font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download WebP</span>
                    </a>
                  )}
                </div>

                {generated.posterUrl ? (
                  /* Real Cloudinary-rendered WebP image from Python worker */
                  <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl max-w-sm mx-auto group">
                    <img
                      src={generated.posterUrl}
                      alt="1080x1080 Branded Poster"
                      className="w-full aspect-square object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                    <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#00F0FF] border border-[#00F0FF]/30">
                      Cloudinary CDN 1080×1080
                    </div>
                  </div>
                ) : (
                  /* Client Live CSS Fallback */
                  <div className="aspect-square max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-zinc-950 via-[#0A0D14] to-blue-950/40 border border-white/[0.08] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#00F0FF]/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="w-9 h-9 rounded-xl bg-[#00F0FF] flex items-center justify-center font-bold text-xs text-[#0A0D14] shadow-md shadow-[#00F0FF]/30">
                        ABCD
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#00F0FF] bg-[#00F0FF]/10 px-2.5 py-1 rounded-full border border-[#00F0FF]/20">
                        LIMITED TIME OFFER
                      </span>
                    </div>

                    <div className="text-center my-auto px-2 relative z-10">
                      <p className="text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-sm">
                        {generated.headline}
                      </p>
                      <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                        {language === "bengali"
                          ? "আজই বুকিং করুন অথবা বিস্তারিত জানতে যোগাযোগ করুন।"
                          : "Book your appointment today or contact us for details."}
                      </p>
                    </div>

                    <div className="rounded-xl p-3 text-center bg-[#00F0FF] text-[#0A0D14] shadow-lg relative z-10">
                      <div className="font-bold text-xs tracking-tight">ABCD Social Hub</div>
                      <div className="text-[10px] font-semibold mt-0.5 flex items-center justify-center gap-1">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span>+91 8944899747 • WhatsApp: +91 8167685731</span>
                      </div>
                      <div className="text-[9px] font-normal opacity-90 truncate">
                        sb.abcd321@gmail.com
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Magic-Link Approval Dispatcher */}
                <div className="pt-2 space-y-3">
                  {!approvalData ? (
                    <button
                      onClick={handleSendApproval}
                      disabled={sendingApproval}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                    >
                      {sendingApproval ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating Secure Magic Link...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send for 1-Tap Mobile Phone Approval</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                        <Check className="w-4 h-4" />
                        <span>Approval Magic Link Generated!</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Dispatched to <strong>sb.abcd321@gmail.com</strong>. You can also send the magic link directly to the business owner via WhatsApp:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <a
                          href={approvalData.whatsAppUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all active:scale-95"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Send via WhatsApp</span>
                        </a>
                        <a
                          href={approvalData.approvalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition-all active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#00F0FF]" />
                          <span>Open Review Page</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 sm:p-14 rounded-2xl bg-[#111722]/40 border border-dashed border-white/[0.08] text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-zinc-900/90 border border-white/[0.06] flex items-center justify-center mx-auto text-zinc-500">
                <Sparkles className="w-5 h-5 text-zinc-500" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-300">No promo generated yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Type or speak your offer on the left, then click &quot;Generate 4-Platform Copy &amp; Poster&quot;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
