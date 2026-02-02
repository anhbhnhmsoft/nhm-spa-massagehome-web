"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, User as UserIcon, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation"; // Hoặc dùng Link nếu muốn tối ưu SEO
import { cn } from "@/lib/utils"; // Giả định bạn có helper cn

export default function PartnerRegisterTypePage() {
  const { t } = useTranslation();
  const router = useRouter();

  // Hàm điều hướng
  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Container giới hạn 750px */}
      <div className="w-full  bg-white shadow-sm flex flex-col min-h-screen">
        {/* --- HEADER (Tương đương HeaderBack) --- */}
        <header className="sticky top-0 z-50 flex items-center bg-white px-4 py-4 border-b border-gray-100">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-900" />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg pr-10 text-slate-900">
            {t("profile.join_partner")}
          </h1>
        </header>

        {/* --- CONTENT --- */}
        <main className="flex-1 px-5 pt-6">
          <h2 className="mb-8 font-bold text-2xl text-slate-900 leading-tight">
            {t("profile.partner_register.title")}
          </h2>

          <div className="space-y-4">
            {/* Trưởng nhóm Kỹ thuật viên */}
            <button
              onClick={() =>
                navigateTo("/partner-register-individual?is_leader=true")
              }
              className="w-full flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex-1 pr-4">
                <h3 className="mb-1 font-bold text-lg text-slate-900">
                  {t("profile.partner_register.individual_title")}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("profile.partner_register.individual_desc")}
                </p>
              </div>
              <div className="h-14 w-14 flex shrink-0 items-center justify-center rounded-full bg-blue-50">
                <UserIcon size={28} className="text-blue-600" />
              </div>
            </button>

            {/* Đại lý khu vực */}
            <button
              onClick={() => navigateTo("/partner-register-agency")}
              className="w-full flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex-1 pr-4">
                <h3 className="mb-1 font-bold text-lg text-slate-900">
                  {t("profile.partner_register.agency_title")}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("profile.partner_register.agency_desc")}
                </p>
              </div>
              <div className="h-14 w-14 flex shrink-0 items-center justify-center rounded-full bg-blue-50">
                <Building2 size={28} className="text-blue-600" />
              </div>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
