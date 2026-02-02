"use client";

import React, { FC } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { cn, formatCurrency } from "@/lib/utils";
import { CouponItem } from "@/features/service/types";

type CouponCardBookingProps = {
  item: CouponItem;
  isSelected: boolean;
  onPress: () => void;
};

export const CouponCardBooking: FC<CouponCardBookingProps> = ({
  item,
  isSelected,
  onPress,
}) => {
  const { t } = useTranslation();

  // Logic kiểm tra disable (Hết hạn hoặc Hết lượt)
  const isExpired = dayjs(item.end_at).isBefore(dayjs());
  const isSoldOut = item.used_count >= item.usage_limit;
  const isDisabled = isExpired || isSoldOut;

  // Logic hiển thị text giảm giá
  const discountDisplay = item.is_percentage
    ? `${Number(item.discount_value)}%`
    : formatCurrency(item.discount_value);

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onPress}
      className={cn(
        "relative flex flex-row w-72 h-32 border rounded-xl overflow-hidden transition-all text-left bg-white shrink-0 outline-none",
        // Style Active / Inactive / Disabled
        isSelected
          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
          : "border-slate-200 hover:border-blue-300",
        isDisabled
          ? "opacity-60 grayscale-[0.5] cursor-not-allowed"
          : "cursor-pointer",
      )}
    >
      {/* === CỘT TRÁI: GIÁ TRỊ GIẢM === */}
      <div
        className={cn(
          "flex flex-col w-24 items-center justify-center border-r border-dashed border-slate-300 p-2 shrink-0 transition-colors",
          isSelected ? "bg-blue-100" : "bg-slate-50",
        )}
      >
        <span className="text-xl font-extrabold text-blue-600 text-center leading-tight">
          {discountDisplay}
        </span>
        <span className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tight">
          {t("common.discount")}
        </span>
      </div>

      {/* === CỘT PHẢI: CHI TIẾT === */}
      <div className="flex-1 p-3 flex flex-col justify-center relative bg-white">
        {/* Label & Code */}
        <div className="flex flex-row justify-between items-start mb-1">
          <div className="flex-1 mr-2 overflow-hidden">
            <p className="font-bold text-slate-800 text-sm truncate leading-tight">
              {item.label}
            </p>
            <div className="inline-block bg-slate-100 px-1.5 py-0.5 rounded mt-1">
              <span className="text-[10px] font-mono text-slate-600 tracking-wider">
                {item.code}
              </span>
            </div>
          </div>

          {/* Checkbox Icon */}
          <div
            className={cn(
              "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
              isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300",
            )}
          >
            {isSelected && (
              <span className="text-white text-[10px] font-bold">✓</span>
            )}
          </div>
        </div>

        {/* Thông tin phụ */}
        <div className="mt-2 space-y-0.5">
          {item.is_percentage && Number(item.max_discount) > 0 && (
            <p className="text-[10px] text-slate-500 leading-none">
              {t("common.max_discount")}:{" "}
              <span className="font-medium text-slate-700">
                {formatCurrency(item.max_discount)}
              </span>
            </p>
          )}

          <p className="text-[10px] text-slate-400 leading-none mt-1">
            {t("common.expire_date")}: {dayjs(item.end_at).format("DD/MM/YYYY")}
          </p>
        </div>

        {/* Watermark Disabled (Dấu mộc Hết hạn/Hết lượt) */}
        {isDisabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[0.5px]">
            <span className="text-red-500 font-bold border-2 border-red-500 px-2 py-1 -rotate-12 rounded-md text-xs uppercase shadow-sm bg-white/90">
              {isSoldOut ? t("common.sold_out") : t("common.expired")}
            </span>
          </div>
        )}
      </div>

      {/* Decorative semicircles (Optional: Hiệu ứng đục lỗ vé số) */}
      <div className="absolute top-1/2 -left-1 w-2 h-2 bg-white border-r border-slate-300 rounded-full -translate-y-1/2"></div>
      <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white border-l border-slate-300 rounded-full -translate-y-1/2"></div>
    </button>
  );
};
