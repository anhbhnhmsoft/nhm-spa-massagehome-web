"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import i18n from "i18next";

import { _StorageKey } from "@/lib/storages/key";
import { _LanguageCode } from "@/lib/const";
import { Storage } from "@/lib/storages";
import { ContractFileType } from "@/features/file/const";

/* ===== Types ===== */

export type LocationApp = {
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  address: string;
};

export interface IApplicationStore {
  language: _LanguageCode;
  loading: boolean;
  location: LocationApp | null;
  contractType: ContractFileType | null;

  // functions
  setLanguage: (lang: _LanguageCode) => Promise<void>;
  hydrateLanguage: () => Promise<void>;

  setLoading: (state: boolean) => void;
  setLocation: (location: LocationApp | null) => void;
  setContractType: (type: ContractFileType) => Promise<void>;
  clearContractType: () => void;
}

/* ===== Store ===== */

const useApplicationStore = create<IApplicationStore>()(
  devtools(
    (set) => ({
      language: _LanguageCode.VI,
      loading: false,
      location: null,
      contractType: null,

      /* ===== Actions ===== */

      setLanguage: async (lang) => {
        try {
          Storage.setItem(_StorageKey.LANGUAGE, lang);
          await i18n.changeLanguage(lang);

          set({ language: lang }, false, "app/setLanguage");
        } catch {
          // silent
        }
      },

      hydrateLanguage: async () => {
        try {
          let lang = Storage.getItem<_LanguageCode>(_StorageKey.LANGUAGE);

          if (lang !== _LanguageCode.EN && lang !== _LanguageCode.VI) {
            lang = _LanguageCode.VI;
          }

          await i18n.changeLanguage(lang);
          set({ language: lang }, false, "app/hydrateLanguage");
        } catch {
          // silent
        }
      },

      setLoading: (state) => {
        set({ loading: state }, false, "app/setLoading");
      },

      setLocation: (location) => {
        set({ location }, false, "app/setLocation");
      },

      setContractType: (type) => {
        set({ contractType: type }, false, "app/setContractType");
      },

      clearContractType: () => {
        set({ contractType: null }, false, "app/clearContractType");
      },
    }),
    {
      name: "ApplicationStore",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);

export default useApplicationStore;
