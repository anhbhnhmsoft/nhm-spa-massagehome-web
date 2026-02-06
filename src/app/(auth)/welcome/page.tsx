"use client";

import React, { useMemo, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SelectLanguage from "@/components/select-language";
import { _APP_NAME, _LanguagesMap } from "@/lib/const";
import useApplicationStore from "@/lib/store";

export default function IndexPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const selectedLang = useApplicationStore((state) => state.language);
  const [modalLangVisible, setModalLangVisible] = useState(false);

  const langConfig = useMemo(
    () => _LanguagesMap.find((lang) => lang.code === selectedLang),
    [selectedLang],
  );

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-[#4A3B32] overflow-hidden">
      {/* Container max-w-[1024px] */}
      <div className="relative flex h-[100dvh] w-full max-w-[1024px] flex-col shadow-2xl overflow-hidden bg-[#4A3B32]">
        {/* 1. BACKGROUND LAYER  */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/bg-index.png"
            alt="background"
            fill // Sử dụng fill để tự động lấp đầy div cha
            priority // Ưu tiên load ảnh nền
            sizes="1024px" // Tối ưu cho Next.js Image
            className="object-cover opacity-60"
          />
        </div>

        {/* 2. MAIN CONTENT LAYER */}
        <div className="relative z-10 flex flex-1 flex-col">
          <div className="flex flex-row items-center justify-between px-5 pt-6">
            <button
              className="p-2 transition-transform active:scale-90"
              onClick={() => router.replace("/")}
              type="button"
            >
              <X className="text-white" size={28} />
            </button>

            <button
              className="flex flex-row items-center rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md transition-colors hover:bg-white/30"
              onClick={() => setModalLangVisible(true)}
            >
              {langConfig?.icon && (
                <div className="relative mr-2 h-5 w-5 overflow-hidden rounded-full">
                  <Image
                    src={langConfig.icon}
                    alt="flag"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <span className="mr-1 font-medium text-white">
                {langConfig?.label}
              </span>
              <ChevronDown className="text-white" size={16} />
            </button>
          </div>

          <div className="mt-20 flex flex-col items-center px-6 text-center text-white">
            <h1 className="mb-4 text-5xl font-bold tracking-wider uppercase">
              {_APP_NAME}
            </h1>
            <p className="max-w-md text-lg font-medium leading-relaxed opacity-90">
              {t("auth.index_label")}
            </p>
          </div>
        </div>

        {/* 3. BOTTOM SHEET AREA */}
        <div className="relative z-20 flex flex-col items-center rounded-t-[32px] bg-white px-6 pb-12 pt-10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
          <button
            className="w-full max-w-sm rounded-full bg-primary-color-2 py-4 text-lg font-bold text-white shadow-md transition-all active:scale-[0.98] hover:opacity-90"
            onClick={() => router.push("/auth")}
          >
            {t("auth.btn_login_register")}
          </button>

          <button
            className="mt-6 py-2 transition-opacity hover:opacity-70"
            onClick={() => router.back()}
          >
            <span className="text-lg font-semibold text-primary-color-2">
              {t("common.skip")}
            </span>
          </button>

          <p className="mt-8 max-w-xs text-center text-xs leading-5 text-gray-400">
            {t("auth.index_label_2")}
          </p>
        </div>
      </div>
      <SelectLanguage
        visible={modalLangVisible}
        onClose={() => setModalLangVisible(false)}
        closeOnSelect
      />
    </main>
  );
}
