"use client";

/**
 * I18nProvider — Client component that initializes react-i18next.
 * Must wrap any component that uses useTranslation().
 *
 * Placed in the root layout so it covers the entire app.
 * The import of i18n.ts triggers i18next.init() as a side-effect.
 */

import "@/src/i18n/i18n"; // ← side-effect: initialises i18next
import { I18nextProvider } from "react-i18next";
import i18n from "@/src/i18n/i18n";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
