"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import vi from "@/i18n/vi.json";
import en from "@/i18n/en.json";
import cn from "@/i18n/cn.json";

import { _LanguageCode } from "@/lib/const";
import useApplicationStore from "@/lib/store";
import { checkLanguage } from "@/lib/utils";

const resources = {
  vi: { translation: vi },
  en: { translation: en },
  cn: { translation: cn },
};

const getBrowserLanguage = (): _LanguageCode => {
  if (typeof window === "undefined") return _LanguageCode.VI;

  const lang = navigator.language.split("-")[0] as _LanguageCode;
  return checkLanguage(lang) ? lang : _LanguageCode.VI;
};

export const initI18n = () => {
  if (i18n.isInitialized) return;

  let savedLanguage: _LanguageCode | null = null;

  if (typeof window !== "undefined") {
    savedLanguage = localStorage.getItem("LANGUAGE") as _LanguageCode | null;
  }

  if (!savedLanguage || !checkLanguage(savedLanguage)) {
    savedLanguage = getBrowserLanguage();
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: _LanguageCode.VI,
    interpolation: {
      escapeValue: false,
    },
  });

  // sync vào zustand store
  useApplicationStore.getState().setLanguage(savedLanguage);
};

export default i18n;
