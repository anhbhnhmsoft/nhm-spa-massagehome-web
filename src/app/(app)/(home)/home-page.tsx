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
export default function UserDashboard() {
  const { t } = useTranslation();
  const [address] = useState("123 Đường ABC, Quận 1..."); // Giả lập location
  const bannerQuery = useListBannerQuery();
  return (
    <div className="min-h-screen bg-slate-50 pb-24 ">
      {/* --- HEADER FLOATING LOCATION --- */}
      <header className="fixed top-0 z-50 w-full flex justify-center px-4 pt-4 pointer-events-none">
        <button className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-md transition-transform active:scale-95 shadow-lg">
          <MapPin size={16} className="text-white" />
          <span className="max-w-[180px] truncate text-sm font-medium text-white md:max-w-xs">
            {address || t("header_app.need_location")}
          </span>
        </button>
      </header>

      <main className="mx-auto max-w-[1024px]">
        {/* --- 1. BANNER --- */}
        <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden md:h-[50vh] lg:rounded-b-[40px]">
          <CarouselBanner bannerQuery={bannerQuery} />
        </section>

        {/* --- 2. QUICK ACTIONS (Nổi lên trên banner) --- */}
        <div className="relative -mt-8 px-4 md:-mt-12 lg:px-8">
          <div className="rounded-3xl bg-white p-4 shadow-xl shadow-slate-200/60 md:p-6">
            <InviteSection />
          </div>
        </div>

        {/* --- 3. TECHNICIANS SECTION --- */}
        <section className="mt-8 px-4 lg:px-8">
          <KTVSection />
        </section>

        {/* --- 4. SERVICES SECTION --- */}
        <section className="mt-8 px-4 lg:px-8">
          <CategorySection />
        </section>
      </main>
    </div>
  );
}
