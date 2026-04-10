import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import type { InitOptions } from "i18next";

import en from "./locales/en.json";
import vi from "./locales/vi.json";

const options: InitOptions = {
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  fallbackLng: "en",
  supportedLngs: ["en", "vi"],
  interpolation: { escapeValue: false },
  detection: {
    order: ["localStorage", "navigator"],
    lookupLocalStorage: "hrm_lang",
    cacheUserLanguage: true,
  } as any, // i18next-browser-languagedetector extends InitOptions at runtime
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(options);

export default i18n;

