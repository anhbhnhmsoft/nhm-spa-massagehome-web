"use client";

import React, { useState } from "react";
import { MapPin, Bell, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import GradientBackground from "./styles/gradient-background";
import { useLocationUser } from "@/features/app/hooks/use-get-user-location";
import { ListLocationModal } from "./location";

type HeaderAppProps = {
  showSearch?: boolean;
  forSearch?: "service" | "massage";
  setTextSearch?: (text: string) => void;
  textSearch?: string;
};

export default function Header({
  showSearch = true,
  forSearch = "service",
  setTextSearch,
  textSearch,
}: HeaderAppProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const locationUser = useLocationUser();
  const checkAuth = true;

  const handleNotificationClick = () => {
    if (!checkAuth) {
      router.push("/auth");
      return;
    }
    router.push("/notification");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        {/* ✅ Gradient wrapper */}
        <GradientBackground className="mx-auto px-4 py-3 md:px-8 max-w-[1024px]">
          <div className="mx-auto max-w-[1024px]">
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-4 mb-3">
              {/* Location */}
              <button
                onClick={() => setShowLocationModal(true)}
                className="flex flex-col items-start flex-1 min-w-0 transition-opacity hover:opacity-80"
              >
                <span className="text-[10px] md:text-xs font-medium text-blue-200 uppercase tracking-wider">
                  {t("header_app.location") || "VỊ TRÍ CỦA BẠN"}
                </span>
                <div className="flex items-center gap-1 w-full">
                  <MapPin size={16} className="text-white shrink-0" />
                  <span className="text-sm md:text-base font-bold text-white truncate">
                    {locationUser?.address ||
                      t("header_app.need_location") ||
                      "Chọn địa chỉ..."}
                  </span>
                </div>
              </button>

              {/* Notification */}
              <button
                onClick={handleNotificationClick}
                className="relative p-2 rounded-full hover:bg-white/10 transition"
              >
                <Bell size={24} className="text-white" />
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              </button>
            </div>

            {/* Search */}
            {showSearch && (
              <div className="w-full mx-auto">
                <div className="relative h-11 flex items-center rounded-xl bg-white px-3 shadow-md focus-within:ring-2 focus-within:ring-blue-400">
                  <Search size={20} className="text-slate-400" />
                  <input
                    className="ml-2 flex-1 bg-transparent text-sm outline-none"
                    placeholder={
                      forSearch === "service"
                        ? t("header_app.search_placeholder_service") ||
                          "Tìm kiếm dịch vụ..."
                        : t("header_app.search_placeholder_massage") ||
                          "Tìm kiếm massage..."
                    }
                    value={textSearch}
                    onChange={(e) => setTextSearch?.(e.target.value)}
                  />
                  {textSearch && (
                    <button
                      onClick={() => setTextSearch?.("")}
                      className="p-1 rounded-full hover:bg-slate-100"
                    >
                      <X size={18} className="text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </GradientBackground>
      </header>

      <ListLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
}
