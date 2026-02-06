"use client";

import React, { FC } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderBackProps {
  title?: string;
  onBack?: () => void;
  className?: string;
}

const HeaderBack: FC<HeaderBackProps> = ({ title, onBack, className }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    }
  };

  return (
    <header
      className={cn(
        "flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white sticky top-0 z-50",
        className,
      )}
    >
      {/* Nút Back */}
      <button
        onClick={handleBack}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
        aria-label="Back"
      >
        <ChevronLeft size={28} className="text-slate-800" />
      </button>

      {/* Title */}
      {title && (
        <h1 className="text-lg font-bold text-slate-800 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          {t(title)}
        </h1>
      )}

      {/* Placeholder để cân bằng header hoặc có thể để trống */}
      <div className="w-8" />
    </header>
  );
};

export default HeaderBack;
