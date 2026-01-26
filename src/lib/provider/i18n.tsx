// src/lib/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import vi from "@/i18n/vi.json";
import en from "@/i18n/en.json";
import cn from "@/i18n/cn.json";

import { _LanguageCode } from "@/lib/const";
import { checkLanguage } from "@/lib/utils";

const resources = {
  vi: { translation: vi },
  en: { translation: en },
  cn: { translation: cn },
};

export const initI18n = () => {
  if (i18n.isInitialized) return;

  let lang: _LanguageCode = _LanguageCode.VI;

  // ❗ CHỈ đọc window ở client
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("LANGUAGE") as _LanguageCode | null;
    if (saved && checkLanguage(saved)) {
      lang = saved;
    } else {
      const browserLang = navigator.language.split("-")[0] as _LanguageCode;
      if (checkLanguage(browserLang)) lang = browserLang;
    }
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: lang,
    fallbackLng: _LanguageCode.VI,
    interpolation: {
      escapeValue: false,
    },
  });
};

export default i18n;
