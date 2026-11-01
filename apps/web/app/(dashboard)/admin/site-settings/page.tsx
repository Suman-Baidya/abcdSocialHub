"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles,
  Save,
  Globe,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  CreditCard,
  Palette,
  Phone,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/site-settings";

export default function AdminSiteSettingsPage() {
  const { data: session, status: authStatus } = useSession();
  const [activeTab, setActiveTab] = useState<"hero" | "pricing" | "features" | "contact">("hero");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const user = session?.user as any;
  const rawRole = user?.role || "TENANT_ADMIN";
  const isSuperAdmin =
    user?.isDeveloper ||
    rawRole === "SUPER_ADMIN" ||
    user?.isSuperAdmin ||
    user?.email === "suman.baidya.pro@gmail.com";

  // Fetch current settings
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/site-settings");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setSettings(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load site settings", err);
      } finally {
        setLoading(false);
      }
    }

    if (authStatus === "authenticated") {
      loadSettings();
    }
  }, [authStatus]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSaveSuccess("Public site settings saved and published live!");
        setTimeout(() => setSaveSuccess(null), 5000);
      } else {
        setSaveError(json.error || "Failed to save settings. Please verify input fields.");
      }
    } catch (err: any) {
      setSaveError(err?.message || "Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all public site content to platform default values?")) {
      setSettings(DEFAULT_SITE_SETTINGS);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
        <div className="h-64 bg-card rounded-2xl border border-border animate-pulse" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
        <p className="text-xs text-muted-foreground">
          Only Super Admins and Developers have authorization to update public site settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageBreadcrumb
        pageTitle="Site Settings & CMS"
        description="Manage public marketing copy, announcements, and pricing in real time."
        hideBreadcrumb={true}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-medium text-foreground transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>Open Public Site</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </Link>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </PageBreadcrumb>

      {/* Save Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}
      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            activeTab === "hero"
              ? "bg-primary/10 text-primary border border-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Hero & Announcements</span>
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            activeTab === "pricing"
              ? "bg-primary/10 text-primary border border-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Pricing Plans (₹)</span>
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            activeTab === "features"
              ? "bg-primary/10 text-primary border border-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Features & Value</span>
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            activeTab === "contact"
              ? "bg-primary/10 text-primary border border-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Brand & Contact</span>
        </button>
      </div>

      {/* Tab 1: Hero & Announcements */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          {/* Announcement Bar Settings */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Top Announcement Ribbon</h3>
                <p className="text-xs text-muted-foreground">
                  Displays a prominent notification at the very top of all public pages.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.announcement?.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcement: {
                        ...settings.announcement,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {settings.announcement?.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={settings.announcement.badge}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        announcement: {
                          ...settings.announcement,
                          badge: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Announcement Message
                  </label>
                  <input
                    type="text"
                    value={settings.announcement.text}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        announcement: {
                          ...settings.announcement,
                          text: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Link Text
                  </label>
                  <input
                    type="text"
                    value={settings.announcement.linkText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        announcement: {
                          ...settings.announcement,
                          linkText: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Link Destination URL
                  </label>
                  <input
                    type="text"
                    value={settings.announcement.linkUrl}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        announcement: {
                          ...settings.announcement,
                          linkUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Hero Content Settings */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Hero Section Headlines</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">
                  Hero Pill Badge Text
                </label>
                <input
                  type="text"
                  value={settings.hero.badgeText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hero: { ...settings.hero, badgeText: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">
                    Headline Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.hero.headline}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero: { ...settings.hero, headline: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">
                    Highlighted Headline Text (Gradient Accent)
                  </label>
                  <input
                    type="text"
                    value={settings.hero.highlightedText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero: { ...settings.hero, highlightedText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1">
                  Subheadline Description
                </label>
                <textarea
                  rows={3}
                  value={settings.hero.subheadline}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hero: { ...settings.hero, subheadline: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">
                    Primary CTA Text
                  </label>
                  <input
                    type="text"
                    value={settings.hero.primaryCtaText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero: { ...settings.hero, primaryCtaText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">
                    Secondary CTA Text
                  </label>
                  <input
                    type="text"
                    value={settings.hero.secondaryCtaText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero: { ...settings.hero, secondaryCtaText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pricing Plans */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {settings.pricingTiers.map((tier, idx) => (
              <div
                key={tier.id}
                className="rounded-2xl border border-border bg-card p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{tier.name}</span>
                    <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tier.popular}
                        onChange={(e) => {
                          const updated = [...settings.pricingTiers];
                          updated[idx].popular = e.target.checked;
                          setSettings({ ...settings, pricingTiers: updated });
                        }}
                        className="rounded border-border text-primary"
                      />
                      <span>Popular Badge</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">
                      Monthly Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      value={tier.price}
                      onChange={(e) => {
                        const updated = [...settings.pricingTiers];
                        updated[idx].price = Number(e.target.value) || 0;
                        setSettings({ ...settings, pricingTiers: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">
                      Plan Description
                    </label>
                    <input
                      type="text"
                      value={tier.description}
                      onChange={(e) => {
                        const updated = [...settings.pricingTiers];
                        updated[idx].description = e.target.value;
                        setSettings({ ...settings, pricingTiers: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">
                      Feature Points (One per line)
                    </label>
                    <textarea
                      rows={5}
                      value={tier.features.join("\n")}
                      onChange={(e) => {
                        const updated = [...settings.pricingTiers];
                        updated[idx].features = e.target.value
                          .split("\n")
                          .filter((f) => f.trim().length > 0);
                        setSettings({ ...settings, pricingTiers: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-[11px] font-mono leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Features & Value */}
      {activeTab === "features" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {settings.features.map((feat, idx) => (
              <div
                key={feat.id}
                className="rounded-2xl border border-border bg-card p-6 space-y-3 text-xs"
              >
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">
                    Card Title
                  </label>
                  <input
                    type="text"
                    value={feat.title}
                    onChange={(e) => {
                      const updated = [...settings.features];
                      updated[idx].title = e.target.value;
                      setSettings({ ...settings, features: updated });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">
                    Pill Badge
                  </label>
                  <input
                    type="text"
                    value={feat.badge}
                    onChange={(e) => {
                      const updated = [...settings.features];
                      updated[idx].badge = e.target.value;
                      setSettings({ ...settings, features: updated });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-medium text-muted-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={feat.description}
                    onChange={(e) => {
                      const updated = [...settings.features];
                      updated[idx].description = e.target.value;
                      setSettings({ ...settings, features: updated });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Brand & Contact */}
      {activeTab === "contact" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-foreground">Contact & Social Channels</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-muted-foreground mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.general.contactEmail}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, contactEmail: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground"
              />
            </div>
            <div>
              <label className="block font-medium text-muted-foreground mb-1">
                Support WhatsApp / Phone
              </label>
              <input
                type="text"
                value={settings.general.contactPhone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, contactPhone: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-muted-foreground mb-1">
              Footer Copyright Text
            </label>
            <input
              type="text"
              value={settings.general.copyrightText}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, copyrightText: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div className="pt-2 border-t border-border/60">
            <h4 className="font-bold text-foreground mb-3">Official Social Links</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Instagram URL
                </label>
                <input
                  type="text"
                  value={settings.general.socialLinks.instagram}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        socialLinks: {
                          ...settings.general.socialLinks,
                          instagram: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Facebook URL
                </label>
                <input
                  type="text"
                  value={settings.general.socialLinks.facebook}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        socialLinks: {
                          ...settings.general.socialLinks,
                          facebook: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={settings.general.socialLinks.linkedin}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        socialLinks: {
                          ...settings.general.socialLinks,
                          linkedin: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

