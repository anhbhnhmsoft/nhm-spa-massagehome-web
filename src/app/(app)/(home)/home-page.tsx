"use client";

import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  CarouselBanner,
  CategorySection,
  InviteSection,
  KTVSection,
} from "@/components/app/home-page";
import { useListBannerQuery } from "@/features/commercial/hooks/use-query";
import { useGetListKTVHomepage } from "@/features/user/hooks";
import { useGetCategoryList } from "@/features/service/hooks";
export default function UserDashboard() {
  const { t } = useTranslation();
  const [address] = useState("123 Đường ABC, Quận 1..."); // Giả lập location
  const bannerQuery = useListBannerQuery();
  const queryKTV = useGetListKTVHomepage();
  const queryCategory = useGetCategoryList({ page: 1, per_page: 5 }, true);

  return (
    <div className="min-h-screen  pb-24 ">
      <main className="mx-auto w-full ">
        {/* --- 1. BANNER --- */}
        <section className="relative w-full overflow-hidden md:h-[50vh] lg:rounded-b-[40px]">
          <button className="absolute left-4 top-4 z-10 pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-md shadow-lg transition-transform active:scale-95">
            <MapPin size={16} className="text-white" />
            <span className="max-w-[180px] truncate text-sm font-medium text-white md:max-w-xs">
              {address || t("header_app.need_location")}
            </span>
          </button>

          <CarouselBanner bannerQuery={bannerQuery} />
        </section>

        {/* --- 2. QUICK ACTIONS (Nổi lên trên banner) --- */}
        <div className="mt-4">
          <InviteSection />
        </div>

        {/* --- 3. TECHNICIANS SECTION --- */}
        <section className="mt-8 px-4 lg:px-8">
          <KTVSection queryKTV={queryKTV} />
        </section>

        {/* --- 4. SERVICES SECTION --- */}
        <section className="mt-8 px-4 lg:px-8">
          <CategorySection queryCategory={queryCategory} />
        </section>
      </main>
    </div>
  );
}
