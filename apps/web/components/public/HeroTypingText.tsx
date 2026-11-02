"use client";

import { useState, useEffect } from "react";

const PHRASES = [
  "Local Retailers & Boutiques",
  "Clinics & Healthcare",
  "Gyms, Salons & Spas",
  "Creators & Influencers",
  "Growing Businesses Across India",
];

export function HeroTypingText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetPhrase = PHRASES[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (currentText.length < targetPhrase.length) {
        timeout = setTimeout(() => {
          setCurrentText(targetPhrase.slice(0, currentText.length + 1));
        }, 70);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(targetPhrase.slice(0, currentText.length - 1));
        }, 35);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, phraseIndex]);

  return (
    <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 text-base sm:text-xl lg:text-2xl font-semibold text-muted-foreground mt-3 sm:mt-4 min-h-[2rem]">
      <span>Automated for</span>
      <span className="bg-gradient-to-r from-primary via-sky-400 to-blue-500 bg-clip-text text-transparent font-bold">
        {currentText || "\u00A0"}
      </span>
      <span
        className="inline-block w-[2.5px] h-[0.9em] bg-primary rounded-full animate-pulse align-middle"
        aria-hidden="true"
      />
    </div>
  );
}
