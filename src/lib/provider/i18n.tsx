// src/lib/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import vi from "@/i18n/vi.json";
import en from "@/i18n/en.json";
import cn from "@/i18n/cn.json";

import { _LanguageCode } from "@/lib/const";
import { checkLanguage } from "@/lib/utils";
import { _StorageKey } from "@/lib/storages/key";
import useApplicationStore from "../store";
import { Storage } from "../storages";

const resources = {
  vi: { translation: vi },
  en: { translation: en },
  cn: { translation: cn },
};

export const initI18n = async () => {
  if (i18n.isInitialized) return;

  const setLanguage = useApplicationStore.getState().setLanguage;

  let savedLanguage = await Storage.getItem<_LanguageCode>(
    _StorageKey.LANGUAGE,
  );

  // Nếu chưa lưu ngôn ngữ hoặc ngôn ngữ không hợp lệ -> mặc định VI
  if (!savedLanguage || !checkLanguage(savedLanguage)) {
    savedLanguage = _LanguageCode.VI;
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: _LanguageCode.VI,
    interpolation: {
      escapeValue: false,
    },
  });

  await Storage.setItem(_StorageKey.LANGUAGE, savedLanguage);
  await setLanguage(savedLanguage);
};

export default i18n;
