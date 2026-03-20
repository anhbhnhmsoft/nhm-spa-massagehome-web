"use client";

import { useChatTranslation } from "@/features/chat/hooks/use-chat-translation";
import { PayloadNewMessage } from "@/features/chat/types";
import { TFunction } from "i18next";
import { Copy } from "lucide-react";
import React from "react";
import { LangPicker } from "./lang-picker";

type SheetContentProps = {
  item: PayloadNewMessage | null;
  isOpen: boolean;
  onClose: () => void;
  t: TFunction;
};

export const MessageSheetContent = ({
  item,
  isOpen,
  onClose,
  t,
}: SheetContentProps) => {
  const { targetLang, translatedChat, handleChangeTargetLang, isTranslating } =
    useChatTranslation();

  const translatedText = targetLang ? translatedChat?.[targetLang] : null;
  const displayContent = translatedText || item?.content;

  const handleCopy = () => {
    if (displayContent) {
      navigator.clipboard.writeText(displayContent);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-xl bg-white p-4 shadow-lg sm:max-w-lg md:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview */}
        <div className="mb-3 rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-sm text-gray-500 line-clamp-3">{displayContent}</p>

          {translatedText && (
            <p className="mt-1 text-xs text-gray-400">
              {t("chat.translation")}
            </p>
          )}

          {isTranslating && (
            <div className="mt-1 flex items-center gap-1">
              <div className="h-2 w-2 animate-spin rounded-full border border-gray-400 border-t-transparent" />
              <p className="text-xs text-gray-400">{t("chat.translating")}</p>
            </div>
          )}
        </div>

        {/* Copy */}
        <button
          onClick={handleCopy}
          className="flex w-full items-center gap-4 rounded-xl px-2 py-4 hover:bg-gray-50 active:bg-gray-100"
        >
          <Copy size={20} color="#374151" />
          <span className="text-base font-medium text-gray-800">
            {t("chat.copy")}
          </span>
        </button>

        <div className="mx-2 h-px bg-gray-100" />

        {/* Lang picker */}
        <LangPicker
          targetLang={targetLang}
          loading={isTranslating}
          handleChangeLang={handleChangeTargetLang}
          t={t}
        />
      </div>
    </div>
  );
};
