"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageBreadcrumbProps {
  pageTitle: string;
  parentTitle?: string;
  parentHref?: string;
}

export function PageBreadcrumb({
  pageTitle,
  parentTitle = "Dashboard",
  parentHref = "/dashboard",
}: PageBreadcrumbProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-bold tracking-tight text-white/95">
        {pageTitle}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5 text-xs">
          <li>
            <Link
              href={parentHref}
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span>{parentTitle}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </Link>
          </li>
          <li className="font-medium text-zinc-200">
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
}
