"use client";

import React, { useState } from "react";
import { X, TrendingUp, ImageOff, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useServiceDetail } from "@/features/service/hooks";
import { formatBalance } from "@/lib/utils";
// Giả định bạn đã cấu hình Image của Next.js hoặc dùng thẻ img
import Image from "next/image";

export default function ServiceDetailsPageComponent() {
  const { t } = useTranslation();
  const router = useRouter();

  // Các hooks logic bạn đã có
  const { detail, pickServiceToBooking } = useServiceDetail();

  const [imageError, setImageError] = useState(false);

  if (!detail) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* --- HEADER CONTAINER --- */}
      <div className="relative w-full h-[60vh] md:h-[500px] overflow-hidden">
        {/* ẢNH NỀN HOẶC ICON FALLBACK */}
        {detail && detail.image_url && !imageError ? (
          <Image
            src={detail.image_url}
            alt={detail.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <ImageOff size={48} className="text-slate-400" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Nút Quay lại */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 z-20 rounded-full bg-white/80 p-2 hover:bg-white transition-colors"
        >
          <ChevronLeft size={24} className="text-primary-color-2" />
        </button>

        {/* Thông tin Dịch vụ */}
        <div className="absolute z-10 p-6 bottom-8 left-0 right-0">
          <h1 className="mb-2 font-bold text-2xl md:text-3xl text-white drop-shadow-md line-clamp-1">
            {detail.name}
          </h1>

          <div className="flex flex-row items-center gap-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={18} className="text-gray-200" />
              <span className="font-medium text-gray-200">
                {detail.bookings_count.toLocaleString()}{" "}
                {t("services.bookings")}
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-1">
              <span className="font-bold text-xs text-primary-color-1">
                {detail.category.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- BODY CONTENT --- */}
      <div className="relative -mt-6 rounded-t-[32px] bg-white px-5 pt-8">
        {/* Mô tả dịch vụ */}
        <section className="mb-8 max-w-2xl mx-auto">
          <h2 className="mb-3 font-bold text-xl text-gray-900">
            {t("services.description")}
          </h2>
          <p className="text-lg leading-relaxed text-gray-600">
            {detail.description}
          </p>
        </section>

        {/* Danh sách các Options */}
        <div className="max-w-2xl mx-auto space-y-4">
          {detail.options.map((option, index) => (
            <button
              key={index}
              disabled={!detail.is_active}
              onClick={() =>
                pickServiceToBooking({
                  service_id: detail.id,
                  service_name: detail.name,
                  duration: option.duration,
                  option_id: option.id,
                  price: option.price,
                })
              }
              className="w-full flex items-start justify-between gap-4 rounded-2xl bg-slate-100 p-6 transition-transform active:scale-[0.98] disabled:opacity-50 text-left"
            >
              <div className="flex-1">
                <p className="mb-1 text-sm text-gray-500 uppercase tracking-wide">
                  {t("common.price")}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-3xl text-primary-color-2">
                    {formatBalance(option.price)}
                  </span>
                  <span className="font-bold text-primary-color-2">
                    {t("common.currency")}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-[#your-base-color-3] px-3 py-1.5">
                <span className="font-bold text-sm text-primary-color-1">
                  {option.duration} {t("common.minute")}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
