"use client";

import { _LanguageCode, _LanguagesMap } from "@/lib/const";
import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { TFunction } from "i18next";
import Image from "next/image";

type LangChipProps = {
  code: _LanguageCode;
  label: string;
  icon: any;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: (code: _LanguageCode) => void;
};

export const LangChip = ({
  code,
  label,
  icon,
  isSelected,
  isDisabled,
  onPress,
}: LangChipProps) => {
  const handlePress = useCallback(() => onPress(code), [onPress, code]);

  return (
    <button
      disabled={isDisabled}
      onClick={handlePress}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-2 transition-colors cursor-pointer",
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white",
        isDisabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <Image
        src={icon}
        alt={label}
        width={16}
        height={16}
        className="rounded-full"
      />
      <span
        className={cn(
          "text-xs font-medium",
          isSelected ? "text-blue-600" : "text-gray-700",
        )}
      >
        {label}
      </span>
    </button>
  );
};

export const LangPicker = ({
  targetLang,
  loading,
  handleChangeLang,
  t,
}: {
  targetLang: _LanguageCode | null;
  loading: boolean;
  handleChangeLang: (code: _LanguageCode) => void;
  t: TFunction;
}) => {
  return (
    <div>
      <div className="mx-2 h-px bg-gray-100" />

      <p className="px-2 pb-2 pt-3 text-xs text-gray-400">
        {t("review.translate_to")}
      </p>

      <div className="flex flex-row flex-wrap gap-2 px-2 pb-2">
        {_LanguagesMap.map((lang) => (
          <LangChip
            key={lang.code}
            code={lang.code}
            label={lang.label}
            icon={lang.icon}
            isSelected={targetLang === lang.code}
            isDisabled={loading}
            onPress={handleChangeLang}
          />
        ))}
      </div>
    </div>
  );
};
