"use client";

import { useState } from "react";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  PieChart,
  BarChart3,
  Sparkles,
  Flame,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface DayData {
  day: string;
  reach: number;
  leads: number;
}

const WEEK_DATA: DayData[] = [
  { day: "Mon", reach: 320, leads: 12 },
  { day: "Tue", reach: 480, leads: 19 },
  { day: "Wed", reach: 640, leads: 28 },
  { day: "Thu", reach: 590, leads: 24 },
  { day: "Fri", reach: 860, leads: 42 },
  { day: "Sat", reach: 1180, leads: 58 },
  { day: "Sun", reach: 1040, leads: 51 },
];

const CHANNELS_DATA = [
  {
    name: "WhatsApp Direct",
    share: 45,
    inquiries: 87,
    conversion: "18.4%",
    color: "#10B981",
    strokeClass: "stroke-emerald-500",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-500",
  },
  {
    name: "Instagram Pro",
    share: 32,
    inquiries: 62,
    conversion: "12.8%",
    color: "#EC4899",
    strokeClass: "stroke-pink-500",
    bgClass: "bg-pink-500",
    textClass: "text-pink-500",
  },
  {
    name: "Facebook Page",
    share: 15,
    inquiries: 29,
    conversion: "8.2%",
    color: "#3B82F6",
    strokeClass: "stroke-blue-500",
    bgClass: "bg-blue-500",
    textClass: "text-blue-500",
  },
  {
    name: "LinkedIn Feed",
    share: 8,
    inquiries: 15,
    conversion: "5.6%",
    color: "#0284C7",
    strokeClass: "stroke-sky-500",
    bgClass: "bg-sky-500",
    textClass: "text-sky-500",
  },
];

const DISPATCH_HOURS = [
  { time: "09:00 AM", label: "Morning", reach: 420, pct: 60, isPeak: false },
  { time: "01:00 PM", label: "Lunch", reach: 680, pct: 76, isPeak: false },
  { time: "05:30 PM", label: "Evening", reach: 810, pct: 86, isPeak: false },
  { time: "08:30 PM", label: "Prime Time", reach: 1180, pct: 100, isPeak: true },
  { time: "10:30 PM", label: "Night", reach: 490, pct: 54, isPeak: false },
];

const FORMAT_EFFICIENCY = [
  {
    name: "Regional Bengali Posters (1080×1080)",
    score: 88,
    metric: "3.8× Local Reach",
    sub: "Pillow + Cairo regional font shaping",
    colorClass: "bg-primary text-primary",
    barColor: "bg-primary",
  },
  {
    name: "Neural Voiceover Video Reels",
    score: 94,
    metric: "5.4× Watch Time",
    sub: "High-clarity regional speech synthesis",
    colorClass: "bg-purple-500 text-purple-500",
    barColor: "bg-purple-500",
  },
  {
    name: "WhatsApp Direct Inbound Offers",
    score: 79,
    metric: "18.4% Booked",
    sub: "One-tap customer inquiry routing",
    colorClass: "bg-emerald-500 text-emerald-500",
    barColor: "bg-emerald-500",
  },
];

export function PerformanceChart() {
  const [metricTab, setMetricTab] = useState<"all" | "reach" | "leads">("all");
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(5); // Default Sat peak
  const [selectedChannel, setSelectedChannel] = useState<number>(0); // WhatsApp default

  const maxReach = 1300;
  const maxLeads = 70;
  const svgWidth = 520;
  const svgHeight = 160;
  const paddingX = 24;
  const paddingY = 20;

  // SVG coordinates calculation for 7-day curve
  const points = WEEK_DATA.map((d, i) => {
    const x = paddingX + (i / (WEEK_DATA.length - 1)) * (svgWidth - paddingX * 2);
    const yReach = svgHeight - paddingY - (d.reach / maxReach) * (svgHeight - paddingY * 2);
    const yLead = svgHeight - paddingY - (d.leads / maxLeads) * (svgHeight - paddingY * 2);
    return { x, yReach, yLead, data: d };
  });

  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.yReach}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.yReach;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.yReach;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.yReach}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  const activeDay = hoveredDayIdx !== null ? WEEK_DATA[hoveredDayIdx] : WEEK_DATA[5];
  const activeChannelData = CHANNELS_DATA[selectedChannel];

  // Donut circumference
  const donutRadius = 40;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~251.32

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* ─────────────────────────────────────────────────────────────
          ROW 1: Primary 7-Day Performance Curve + Channel Share Donut
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-3.5 items-stretch">
        {/* Card 1: 7-Day Trajectory Area & Lead Bars (2 Columns) */}
        <div className="lg:col-span-2 rounded-xl bg-card border border-border shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-3">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  7-Day Omnichannel Trajectory
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Aggregated views across WhatsApp, Instagram, Facebook & X
              </p>
            </div>

            {/* Metric Mode Filter Tabs */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border self-start sm:self-auto">
              <button
                onClick={() => setMetricTab("all")}
                className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                  metricTab === "all"
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setMetricTab("reach")}
                className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                  metricTab === "reach"
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Reach (Views)
              </button>
              <button
                onClick={() => setMetricTab("leads")}
                className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                  metricTab === "leads"
                    ? "bg-emerald-500 text-white font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Leads (WA)
              </button>
            </div>
          </div>

          {/* Interactive Inspection Bar */}
          <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 rounded-lg border border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{activeDay.day} Performance:</span>
              <span className="text-muted-foreground">Hover points to inspect</span>
            </div>
            <div className="flex items-center gap-3">
              {(metricTab === "all" || metricTab === "reach") && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-semibold text-foreground">{activeDay.reach.toLocaleString()} Views</span>
                </div>
              )}
              {(metricTab === "all" || metricTab === "leads") && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-emerald-500">+{activeDay.leads} Leads</span>
                </div>
              )}
            </div>
          </div>

          {/* SVG Multi-Layer Chart */}
          <div className="w-full overflow-hidden pt-1">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-36 sm:h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="areaGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGradientPrimary" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00D4E0" />
                  <stop offset="100%" stopColor="#00F0FF" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2);
                return (
                  <line
                    key={idx}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-border"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Inbound Leads Column Bars (when 'all' or 'leads' active) */}
              {(metricTab === "all" || metricTab === "leads") &&
                points.map((pt, i) => {
                  const barWidth = 14;
                  const barHeight = (pt.data.leads / maxLeads) * (svgHeight - paddingY * 2);
                  const barY = svgHeight - paddingY - barHeight;
                  const isHovered = hoveredDayIdx === i;

                  return (
                    <rect
                      key={`bar-${i}`}
                      x={pt.x - barWidth / 2}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      rx="3"
                      className={`transition-all duration-200 cursor-pointer ${
                        isHovered ? "fill-emerald-500 opacity-90" : "fill-emerald-500 opacity-35"
                      }`}
                      onMouseEnter={() => setHoveredDayIdx(i)}
                    />
                  );
                })}

              {/* Area Wave & Curve for Reach (when 'all' or 'reach' active) */}
              {(metricTab === "all" || metricTab === "reach") && (
                <>
                  <path d={areaD} fill="url(#areaGradientPrimary)" />
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#lineGradientPrimary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Interactive Data Nodes */}
              {points.map((pt, i) => {
                const isHovered = hoveredDayIdx === i;
                const nodeY = metricTab === "leads" ? pt.yLead : pt.yReach;

                return (
                  <g
                    key={`node-${i}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDayIdx(i)}
                    onClick={() => setHoveredDayIdx(i)}
                  >
                    <circle
                      cx={pt.x}
                      cy={nodeY}
                      r={isHovered ? 5.5 : 3.5}
                      fill={isHovered ? "#00F0FF" : "hsl(var(--card))"}
                      stroke={metricTab === "leads" ? "#10B981" : "#00F0FF"}
                      strokeWidth={isHovered ? "3" : "2"}
                      className="transition-all duration-150"
                    />
                    <text
                      x={pt.x}
                      y={svgHeight - 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isHovered ? "hsl(var(--primary))" : "currentColor"}
                      className={`font-medium ${isHovered ? "font-bold" : "text-muted-foreground"}`}
                    >
                      {pt.data.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Summary Pill Row */}
          <div className="pt-2 border-t border-border grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-1.5 rounded-lg bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">7-Day Reach</span>
              <span className="font-bold text-foreground">5,110 Views</span>
            </div>
            <div className="p-1.5 rounded-lg bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Total Leads</span>
              <span className="font-bold text-emerald-500">234 Inquiries</span>
            </div>
            <div className="p-1.5 rounded-lg bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Growth WoW</span>
              <span className="font-bold text-primary">+24.6%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Omnichannel Acquisition & Conversion Donut (1 Column) */}
        <div className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Channel Share</h3>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Acquisition
            </span>
          </div>

          {/* Donut SVG Meter + Center Stat */}
          <div className="flex items-center justify-center my-auto py-2">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Channel 1: WhatsApp 45% (113.1 / 251.32) */}
                <circle
                  cx="50"
                  cy="50"
                  r={donutRadius}
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${donutCircumference * 0.45} ${donutCircumference}`}
                  strokeDashoffset="0"
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                  onClick={() => setSelectedChannel(0)}
                />
                {/* Channel 2: Instagram 32% (80.4 / 251.32) offset -113.1 */}
                <circle
                  cx="50"
                  cy="50"
                  r={donutRadius}
                  stroke="#EC4899"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${donutCircumference * 0.32} ${donutCircumference}`}
                  strokeDashoffset={`-${donutCircumference * 0.45}`}
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                  onClick={() => setSelectedChannel(1)}
                />
                {/* Channel 3: Facebook 15% (37.7 / 251.32) offset -193.5 */}
                <circle
                  cx="50"
                  cy="50"
                  r={donutRadius}
                  stroke="#3B82F6"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${donutCircumference * 0.15} ${donutCircumference}`}
                  strokeDashoffset={`-${donutCircumference * 0.77}`}
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                  onClick={() => setSelectedChannel(2)}
                />
                {/* Channel 4: LinkedIn 8% (20.1 / 251.32) offset -231.2 */}
                <circle
                  cx="50"
                  cy="50"
                  r={donutRadius}
                  stroke="#0284C7"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${donutCircumference * 0.08} ${donutCircumference}`}
                  strokeDashoffset={`-${donutCircumference * 0.92}`}
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                  onClick={() => setSelectedChannel(3)}
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 pointer-events-none">
                <span className="text-sm font-extrabold text-foreground leading-none">
                  {activeChannelData.share}%
                </span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-tight mt-0.5 truncate max-w-[65px]">
                  {activeChannelData.name.split(" ")[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Channel List */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            {CHANNELS_DATA.map((ch, idx) => {
              const isSelected = selectedChannel === idx;
              return (
                <button
                  key={ch.name}
                  onClick={() => setSelectedChannel(idx)}
                  className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected ? "bg-muted font-semibold" : "hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ch.color }} />
                    <span className="text-foreground truncate">{ch.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-[11px]">
                    <span className="font-semibold text-foreground">{ch.share}%</span>
                    <span className={`text-[10px] px-1 rounded ${ch.textClass} bg-muted`}>
                      {ch.conversion}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROW 2: Peak Dispatch Hours (IST) + Content Format Efficiency
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 items-stretch">
        {/* Card 3: Hourly Dispatch Heatmap (IST Bar Chart) */}
        <div className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Peak Dispatch Times (IST)</h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Flame className="w-3 h-3" />
              <span>Optimal: 8:30 PM IST</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Indian audience engagement patterns mapped to automated publishing triggers.
          </p>

          {/* Vertical Bar Distribution */}
          <div className="grid grid-cols-5 gap-2 items-end h-28 pt-2 pb-1">
            {DISPATCH_HOURS.map((hr) => (
              <div key={hr.time} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-foreground opacity-80 group-hover:opacity-100 transition-opacity">
                  {hr.reach}
                </span>
                <div className="w-full bg-muted/60 rounded-t-md h-full max-h-20 flex items-end overflow-hidden p-0.5">
                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      hr.isPeak
                        ? "bg-gradient-to-t from-primary to-amber-400 shadow-sm shadow-primary/30"
                        : "bg-muted-foreground/30 group-hover:bg-primary/50"
                    }`}
                    style={{ height: `${hr.pct}%` }}
                  />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-semibold text-foreground block leading-tight">
                    {hr.time.split(" ")[0]}
                  </span>
                  <span className="text-[9px] text-muted-foreground block">
                    {hr.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Autopilot engine schedules campaigns around prime response windows.</span>
            <span className="text-primary font-semibold shrink-0">+3.4× ROI</span>
          </div>
        </div>

        {/* Card 4: Content Format Success Matrix */}
        <div className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Content Format Matrix</h3>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              ROI Benchmark
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Effectiveness rating across regional posters, AI voice reels, and direct offers.
          </p>

          <div className="space-y-3 py-1">
            {FORMAT_EFFICIENCY.map((fmt) => (
              <div key={fmt.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground truncate max-w-[220px]">
                    {fmt.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-foreground">{fmt.metric}</span>
                    <span className="text-[10px] text-muted-foreground">({fmt.score}%)</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${fmt.barColor}`}
                    style={{ width: `${fmt.score}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground block truncate">{fmt.sub}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Multi-modal regional campaigns yield highest conversion in Tier 2/3 markets.</span>
          </div>
        </div>
      </div>
    </div>
  );
}