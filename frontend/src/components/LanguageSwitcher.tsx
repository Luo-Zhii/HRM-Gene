"use client";

/**
 * LanguageSwitcher — compact EN/VI toggle button.
 *
 * Usage:
 *   Standalone pill in the Header navbar:    <LanguageSwitcher />
 *   Inside a menu as a row item:             <LanguageSwitcher variant="menu" />
 *
 * Both variants share the same i18next `changeLanguage()` call and
 * instantly update every component using `useTranslation()` across the app.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

interface Props {
  /** "pill"  — compact toggle shown in the Header bar (default)
   *  "menu"  — full-width row used inside the avatar dropdown  */
  variant?: "pill" | "menu";
}

const LANGUAGES = [
  { code: "en", label: "EN", flagEmoji: "🇬🇧", fullName: "English" },
  { code: "vi", label: "VI", flagEmoji: "🇻🇳", fullName: "Tiếng Việt" },
] as const;

export default function LanguageSwitcher({ variant = "pill" }: Props) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("vi") ? "vi" : "en";

  const toggleLanguage = () => {
    const next = currentLang === "en" ? "vi" : "en";
    // changeLanguage also triggers the LanguageDetector to persist to localStorage
    i18n.changeLanguage(next);
  };

  const other = LANGUAGES.find((l) => l.code !== currentLang)!;
  const current = LANGUAGES.find((l) => l.code === currentLang)!;

  // ── Pill variant (Header navbar) ────────────────────────────────────────────
  if (variant === "pill") {
    return (
      <button
        onClick={toggleLanguage}
        title={`Switch to ${other.fullName}`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-all select-none"
      >
        <Globe size={14} className="text-gray-400" />
        <span>{current.flagEmoji}</span>
        <span className="font-bold tracking-wide">{current.label}</span>
      </button>
    );
  }

  // ── Menu variant (Avatar dropdown) ──────────────────────────────────────────
  return (
    <button
      onClick={toggleLanguage}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
    >
      <Globe size={16} className="text-gray-400 shrink-0" />
      <span className="flex-1">
        {current.fullName}
      </span>
      {/* Show the next language as a badge hint */}
      <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
        → {other.label}
      </span>
    </button>
  );
}
