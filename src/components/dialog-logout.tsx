"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import GradientBackground from "./styles/gradient-background";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutModalProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay: Làm tối nhẹ và mờ nền phía sau */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-[380px] overflow-hidden rounded-[24px] shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Cập nhật GradientBackground với màu mới */}
        <GradientBackground
          className="p-8"
          colors={["#044984", "#2B7BBE"]}
          style={{
            background: `linear-gradient(135deg, #044984 0%, #2B7BBE 100%)`,
          }} // Fallback style
        >
          {/* Nút đóng (X) - Tinh chỉnh vị trí và hover */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute right-5 top-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all active:scale-90"
          >
            <X size={20} className="text-white/80" />
          </button>

          {/* Header Section */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 p-4 bg-white/10 rounded-2xl ring-1 ring-white/20 shadow-inner">
              <LogOut className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {t("profile.log_out_title")}
            </h2>

            <p className="mt-3 text-blue-100/80 text-sm leading-relaxed px-2">
              {t("profile.log_out_desc")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col gap-3">
            {/* Nút Đăng xuất - Sử dụng nền trắng hoặc đỏ để nổi bật trên nền xanh */}
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "w-full h-13 py-3.5 flex items-center justify-center rounded-xl font-bold transition-all duration-200",
                "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-900/30 active:scale-[0.97]",
                isLoading && "opacity-70 cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t("common.accept")
              )}
            </button>

            {/* Nút Hủy - Trong suốt để giảm sự chú ý */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full h-13 py-3.5 rounded-xl font-semibold text-white/90 hover:bg-white/10 transition-all border border-white/20 backdrop-blur-sm"
            >
              {t("common.cancel")}
            </button>
          </div>
        </GradientBackground>
      </div>
    </div>
  );
};

export default LogoutModal;
