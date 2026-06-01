"use client";

/**
 * I18nProvider — Client component that initializes react-i18next.
 * Must wrap any component that uses useTranslation().
 *
 * Placed in the root layout so it covers the entire app.
 * The import of i18n.ts triggers i18next.init() as a side-effect.
 */

import { useEffect, useState } from "react";
import "@/i18n/i18n"; // ← side-effect: initialises i18next
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/i18n";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return null to avoid hydration mismatch (same HTML content on SSR and initial CSR)
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
