"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import React from "react";

interface PageBreadcrumbProps {
  pageTitle: string;
  description?: string;
  parentTitle?: string;
  parentHref?: string;
  children?: React.ReactNode;
}

export function PageBreadcrumb({
  pageTitle,
  description,
  parentTitle = "Dashboard",
  parentHref = "/dashboard",
  children,
}: PageBreadcrumbProps) {
  return (
    <div className="mb-8 pb-5 border-b border-zinc-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Optional Subtitle */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            {pageTitle}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Right Section: Breadcrumb Trail & Page Action */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 self-start sm:self-auto shrink-0">
          <nav aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs">
              <li>
                <Link
                  href={parentHref}
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{parentTitle}</span>
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </li>
              <li className="font-semibold text-zinc-200">
                {pageTitle}
              </li>
            </ol>
          </nav>

          {children && (
            <div className="flex items-center gap-2.5">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageBreadcrumb;
