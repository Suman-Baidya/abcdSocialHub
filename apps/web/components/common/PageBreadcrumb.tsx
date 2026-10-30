"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import React from "react";

interface PageBreadcrumbProps {
  pageTitle: string;
  description?: React.ReactNode;
  parentTitle?: string;
  parentHref?: string;
  hideBreadcrumb?: boolean;
  children?: React.ReactNode;
}

export function PageBreadcrumb({
  pageTitle,
  description,
  parentTitle = "Dashboard",
  parentHref = "/dashboard",
  hideBreadcrumb = false,
  children,
}: PageBreadcrumbProps) {
  return (
    <div className="mb-4 sm:mb-5 pb-3 border-b border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Title & Subtitle with tightened spacing */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {pageTitle}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl leading-snug">
              {description}
            </p>
          )}
        </div>

        {/* Right Section: Breadcrumb Trail (Optional) & Page Action */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start sm:self-auto shrink-0">
          {!hideBreadcrumb && (
            <nav aria-label="Breadcrumb">
              <ol className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs">
                <li>
                  <Link
                    href={parentHref}
                    className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Home className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{parentTitle}</span>
                  </Link>
                </li>
                <li>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                </li>
                <li className="font-semibold text-foreground">
                  {pageTitle}
                </li>
              </ol>
            </nav>
          )}

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
