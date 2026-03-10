"use client";

import React, { useState } from "react";
import { MapPin, Bell, Search, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ListLocationModal } from "./location";
import useApplicationStore from "@/lib/store";

type HeaderAppProps = {
  showSearch?: boolean;
  forSearch?: "service" | "massage";
  setTextSearch?: (text: string) => void;
  textSearch?: string;
};

export default function Header({
  showSearch = false,
  forSearch,
  setTextSearch,
  textSearch,
}: HeaderAppProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const locationUser = useApplicationStore((state) => state.location);

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
      <header className="w-full bg-white px-4 md:px-6 pb-4 border-b border-gray-200 rounded-b-md">
        {/* === VỊ TRÍ & THÔNG BÁO === */}
        <div className="flex items-center justify-between mb-4 gap-2 pt-10 md:pt-6">
          {/* Location */}
          <button
            className="flex items-center flex-1 min-w-0"
            onClick={() => setShowLocationModal(true)}
          >
            <MapPin size={20} className="text-gray-500 shrink-0" />

            <div className="ml-3 flex-1 flex flex-col items-start min-w-0">
              <span className="text-[11px] md:text-xs text-gray-500 font-medium">
                {t("header_app.location")}
              </span>

              <div className="flex items-center w-full min-w-0">
                <span className="text-[14px] md:text-base font-semibold text-gray-900 mr-2 truncate">
                  {locationUser?.address || t("header_app.need_location")}
                </span>

                <ChevronDown size={16} className="text-gray-500 shrink-0" />
              </div>
            </div>
          </button>

          {/* Notification */}
          <button
            onClick={handleNotificationClick}
            className="relative flex items-center justify-center w-10 h-10"
          >
            <Bell size={22} className="text-gray-600" />
          </button>
        </div>

        {/* === SEARCH BAR === */}
        {showSearch && (
          <div className="flex items-center bg-gray-100 border border-gray-200 rounded-xl px-4 h-11">
            <Search size={18} className="text-gray-400" />

            <input
              className="flex-1 ml-3 font-medium text-sm text-gray-900 bg-transparent outline-none"
              placeholder={
                forSearch === "service"
                  ? t("header_app.search_placeholder_service")
                  : t("header_app.search_placeholder_massage")
              }
              value={textSearch}
              onChange={(e) => setTextSearch?.(e.target.value)}
            />
          </div>
        )}
      </header>

      <ListLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
}
