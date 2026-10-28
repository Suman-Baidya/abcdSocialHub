"use client";

import { useState } from "react";
import { TrendingUp, Users, MessageSquare, ArrowUpRight } from "lucide-react";

interface DayData {
  day: string;
  reach: number;
  leads: number;
}

const WEEK_DATA: DayData[] = [
  { day: "Mon", reach: 240, leads: 8 },
  { day: "Tue", reach: 380, leads: 14 },
  { day: "Wed", reach: 520, leads: 22 },
  { day: "Thu", reach: 490, leads: 19 },
  { day: "Fri", reach: 760, leads: 34 },
  { day: "Sat", reach: 980, leads: 48 },
  { day: "Sun", reach: 890, leads: 41 },
];

export function PerformanceChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(6); // Default to latest day (Sun)

  const maxReach = 1100;
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 24;
  const paddingY = 20;

  // Calculate coordinates for the SVG path
  const points = WEEK_DATA.map((d, i) => {
    const x = paddingX + (i / (WEEK_DATA.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.reach / maxReach) * (svgHeight - paddingY * 2);
    return { x, y, data: d };
  });

  // Create smooth bezier curve string
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, "");

  // Create closed area fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  const activeData = hoveredIdx !== null ? WEEK_DATA[hoveredIdx] : WEEK_DATA[6];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
            <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
              7-Day Reach & Lead Trajectory
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Aggregated across WhatsApp, Instagram, Facebook & X
          </p>
        </div>

        {/* Dynamic Metric Pill */}
        <div className="flex items-center gap-3 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="text-xs text-zinc-400">{activeData.day}:</span>
            <span className="text-xs font-semibold text-white">{activeData.reach} Views</span>
          </div>
          <div className="h-3 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">+{activeData.leads} Inquiries</span>
          </div>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="w-full overflow-hidden pt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-36 sm:h-44 overflow-visible"
        >
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
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
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#cyanGradient)" />

          {/* Curved Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onClick={() => setHoveredIdx(i)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? "#00F0FF" : "#0A0D14"}
                  stroke="#00F0FF"
                  strokeWidth={isHovered ? "3" : "2"}
                  className="transition-all duration-150"
                />
                {/* Day label below */}
                <text
                  x={pt.x}
                  y={svgHeight - 2}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isHovered ? "#00F0FF" : "#71717A"}
                  className="font-medium"
                >
                  {pt.data.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Channel Distribution Mini-Bars */}
      <div className="pt-2 border-t border-white/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between text-zinc-400">
            <span>WhatsApp WA</span>
            <span className="text-emerald-400 font-medium">45%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "45%" }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-zinc-400">
            <span>Instagram</span>
            <span className="text-pink-400 font-medium">32%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 rounded-full" style={{ width: "32%" }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-zinc-400">
            <span>Facebook</span>
            <span className="text-blue-400 font-medium">15%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "15%" }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-zinc-400">
            <span>LinkedIn</span>
            <span className="text-sky-400 font-medium">8%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full" style={{ width: "8%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
