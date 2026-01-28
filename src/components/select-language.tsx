"use client";

import { useTranslation } from "react-i18next";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { _LanguageCode, _LanguagesMap } from "@/lib/const";
import { useSetLanguageUser } from "@/features/auth/hooks";

type SelectLanguageProps = {
  visible: boolean;
  onClose: () => void;
  closeOnSelect?: boolean;
};

export default function SelectLanguage({
  visible,
  onClose,
  closeOnSelect,
}: SelectLanguageProps) {
  const { t } = useTranslation();
  const { setLanguage, selectedLang, isPending } = useSetLanguageUser(onClose);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      {/* Modal */}
      <div className="absolute bottom-0 left-1/2 w-full max-w-[1024px] -translate-x-1/2 animate-slide-up rounded-t-3xl bg-white">
        {/* HEADER */}
        <div className="relative flex items-center justify-between border-b px-5 py-4">
          <button onClick={onClose} className="p-1">
            <X size={24} className="text-gray-700" />
          </button>

          <h3 className="absolute inset-x-0 text-center text-lg font-semibold">
            {t("common.select_language")}
          </h3>

          <div className="w-6" />
        </div>

        {/* BODY */}
        <div className="px-5 py-2">
          {isPending ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-color-1 border-t-transparent" />
            </div>
          ) : (
            _LanguagesMap.map((lang) => {
              const isSelected = selectedLang === lang.code;

              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    if (closeOnSelect) onClose();
                  }}
                  className="flex w-full items-center justify-between border-b py-4"
                >
                  {/* Flag + name */}
                  <div className="flex items-center gap-2">
                    <Image
                      src={lang.icon}
                      alt={lang.label}
                      width={24}
                      height={24}
                    />
                    <span
                      className={cn(
                        "text-base",
                        isSelected
                          ? "font-medium text-primary-color-1"
                          : "text-gray-700",
                      )}
                    >
                      {lang.label}
                    </span>
                  </div>

                  {/* Radio */}
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border",
                      isSelected
                        ? "border-primary-color-2 bg-primary-color-2"
                        : "border-gray-300",
                    )}
                  >
                    {isSelected && (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
