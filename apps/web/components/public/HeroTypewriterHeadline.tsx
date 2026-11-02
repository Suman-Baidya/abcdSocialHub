"use client";

import { useState, useEffect } from "react";

interface HeroTypewriterHeadlineProps {
  headline?: string;
  defaultHighlight?: string;
}

const PHRASES = [
  "Local Retailers & Boutiques",
  "Clinics & Healthcare",
  "Gyms, Salons & Spas",
  "Creators & Influencers",
  "Growing Businesses Across India",
];

export function HeroTypewriterHeadline({
  headline = "Social Media That Runs on 100% Autopilot",
  defaultHighlight = "Zero Manual Design. Zero Chaos.",
}: HeroTypewriterHeadlineProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetPhrase = PHRASES[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing forward
      if (currentText.length < targetPhrase.length) {
        timeout = setTimeout(() => {
          setCurrentText(targetPhrase.slice(0, currentText.length + 1));
        }, 75);
      } else {
        // Finished typing, pause before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      // Deleting
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(targetPhrase.slice(0, currentText.length - 1));
        }, 40);
      } else {
        // Finished deleting, move to next phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, phraseIndex]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] max-w-4xl mx-auto text-foreground">
        <span>{headline}</span>
      </h1>

      {/* Dynamic Typing Sub-Headline */}
      <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 text-lg sm:text-2xl lg:text-3xl font-semibold text-muted-foreground min-h-[2.4rem] sm:min-h-[2.8rem]">
        <span>Automated for</span>
        <span className="bg-gradient-to-r from-primary via-sky-400 to-blue-500 bg-clip-text text-transparent font-bold">
          {currentText || "\u00A0"}
        </span>
        <span
          className="inline-block w-[2.5px] h-[1em] bg-primary rounded-full animate-pulse align-middle"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

