"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  MapPin,
  RotateCw,
  AlertCircle,
  ArrowLeft,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { cn, formatBalance, formatDistance } from "@/lib/utils";
import { ListLocationModal } from "@/components/location";
import { CouponCardBooking } from "@/components/app/coupon-card";
import { CouponItem } from "@/features/service/types";
import dayjs from "dayjs";
import { useBooking } from "@/features/booking/hooks/use-booking";
import { _BookingStatus } from "@/features/service/const";
import HeaderBack from "@/components/header-back";
import { AvatarKTV } from "@/components/app/masseurs-details";

export default function ServiceBookingPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const { item, queryCoupon, form, dataPricing, error, handleBookingService } =
    useBooking();

  const {
    control,
    formState: { errors },
    setValue,
    handleSubmit,
  } = form;
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  if (!item) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white p-6 text-center">
        <RotateCw className="mb-4 animate-spin text-blue-500" size={32} />
        <p className="text-gray-500 font-medium">{t("common.loading_data")}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-primary-color-2 flex items-center gap-2 text-sm font-bold"
        >
          <ArrowLeft size={16} /> {t("common.back_to_home")}
        </button>
      </div>
    );
  }

  return (
    // Max-w-md giúp app trông như mobile app trên màn hình Desktop
    <main className="relative min-h-screen bg-slate-50 flex flex-col w-full mx-auto border-x shadow-sm">
      <HeaderBack title={t("services.booking_title")} />
      <div className="flex-1 flex flex-col px-5 pb-28 pt-6">
        {/* Form chính */}
        <form
          onSubmit={handleSubmit(handleBookingService)}
          className="flex flex-1 flex-col space-y-7"
        >
          {/* Information Service */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-lg">
            {/* Header: THÔNG TIN KTV */}
            <div className="flex items-center">
              <AvatarKTV source={item.ktv.image_url} />

              <div className="flex-1 ml-4">
                <p className="text-base font-bold">{item.ktv.name}</p>
                <div className="flex items-center mt-1 gap-2">
                  <div className="flex items-center">
                    <Star className="mr-1 w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-semibold">
                      {item.ktv.rating} {t("masseurs_detail.review_count")}
                    </span>
                  </div>
                  {dataPricing?.distance && (
                    <div className="flex items-center">
                      <MapPin className="mr-1 w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold">
                        {formatDistance(dataPricing.distance)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {dataPricing?.break_time && (
              <p className="text-xs text-gray-400 italic mt-2 leading-6">
                {t("services.time_to_go_to_place", {
                  break_time: dataPricing.break_time,
                })}
              </p>
            )}
            {/* Separator */}
            <div className="h-px bg-gray-200 my-4" />

            {/* Service Name */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-gray-400">
                {t("services.service_name")}
              </span>
              <span className="text-sm font-bold text-gray-600 truncate">
                {item.service.name}
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-gray-500 text-sm">
                {t("services.duration")}
              </span>
              <span className="font-semibold text-sm">
                {item.service.duration} {t("common.minute")}
              </span>
            </div>

            {/* Tiền dịch vụ */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-gray-500 text-sm">
                {t("services.price_service")}
              </span>
              <span className="font-semibold text-sm">
                {formatBalance(dataPricing?.price || item.service.temp_price)}{" "}
                {t("common.currency")}
              </span>
            </div>

            {/* Tiền khoảng cách */}
            {!!dataPricing?.price_distance && (
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-gray-500 text-sm">
                  {t("services.distance_price")}
                </span>
                <span className="font-semibold text-sm">
                  {formatBalance(dataPricing.price_distance || 0)}{" "}
                  {t("common.currency")}
                </span>
              </div>
            )}

            {/* Tiền giảm giá */}
            {!!dataPricing?.discount_coupon && (
              <div className="flex items-center justify-between gap-2 mb-3 ">
                <span className="text-gray-500 text-sm">
                  {t("services.discount")}
                </span>
                <span className="font-semibold text-sm">
                  {formatBalance(dataPricing.discount_coupon || 0)}
                  {t("common.currency")}
                </span>
              </div>
            )}

            {/* Separator */}
            <div className="h-px bg-gray-200 mb-4" />

            {/* Tổng tiền */}
            <div className="flex justify-between items-center">
              <span className="text-base font-bold">{t("common.total")}</span>
              <span className="text-lg font-bold text-primary-color-2">
                {formatBalance(
                  dataPricing?.final_price || item.service.temp_price,
                )}{" "}
                {t("common.currency")}
              </span>
            </div>
          </div>

          {/* Warning Card */}
          {dataPricing?.booking_today && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-center">
              <div className="bg-yellow-100 p-1.5 rounded-full mr-3">
                <AlertCircle size={18} color="#f59e0b" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-yellow-600 text-sm italic leading-5">
                  {dataPricing.booking_today.status ===
                    _BookingStatus.CONFIRMED &&
                    t("booking.warning_alert_service_booking_confirm", {
                      time: dayjs(
                        dataPricing.booking_today.booking_time,
                      ).format("HH:mm"),
                    })}
                  {dataPricing.booking_today.status ===
                    _BookingStatus.ONGOING &&
                    t("booking.warning_alert_service_booking_ongoing", {
                      time: dayjs(dataPricing.booking_today.start_time).format(
                        "HH:mm",
                      ),
                    })}
                </p>
              </div>
            </div>
          )}

          {/* Error Card */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center">
              <div className="bg-red-100 p-1.5 rounded-full mr-3">
                <AlertCircle size={18} color="#ef4444" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-red-600 text-sm italic leading-5">{error}</p>
              </div>
            </div>
          )}

          {/* Địa chỉ - Cải thiện clickable area */}
          <div className="space-y-2">
            <label className="font-bold text-sm text-gray-700 flex justify-between">
              <span>{t("services.address")} *</span>
            </label>

            <Controller
              control={control}
              name="address"
              render={({ field: { value } }) => (
                <div
                  onClick={() => setShowLocationModal(true)}
                  className={cn(
                    "flex cursor-pointer items-center  bg-white rounded-xl p-4 border border-slate-100 shadow- 50 px-4 py-4 transition-all hover:border-blue-400 active:scale-[0.98]",
                    errors.address && "border-red-300 bg-red-50/30",
                  )}
                >
                  <div className="mr-3 rounded-xl bg-white p-2 text-primary-color-2 shadow-sm">
                    <MapPin size={20} />
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {value ? (
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                        {value}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 font-medium">
                        {t("location.placeholder_address")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            />
            {errors.address && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-red-500 animate-in shake-1">
                <AlertCircle size={12} /> {errors.address.message as string}
              </span>
            )}
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              {t("services.note")}
            </label>
            <Controller
              control={control}
              name="note"
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  placeholder={t("common.optional_note")}
                  className={cn(
                    "w-full resize-none rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400",
                    errors.note && "border-red-500",
                  )}
                />
              )}
            />
          </div>

          {/* Mã giảm giá - UI ngang */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">
                {t("common.coupon")}
              </label>
              <button
                type="button"
                onClick={() => queryCoupon.refetch()}
                className="text-xs font-bold text-primary-color-2 flex items-center gap-1 active:opacity-60"
              >
                {queryCoupon.isRefetching ? (
                  <RotateCw size={12} className="animate-spin" />
                ) : (
                  t("common.refresh")
                )}
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
              {queryCoupon.isLoading ? (
                <div className="h-24 w-full flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                  <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                (queryCoupon.data || []).map((cp: CouponItem) => (
                  <div key={cp.id} className="min-w-[280px]">
                    <Controller
                      control={control}
                      name="coupon_id"
                      render={({ field: { value, onChange } }) => (
                        <CouponCardBooking
                          item={cp}
                          isSelected={value === cp.id}
                          onPress={() => {
                            if (value === cp.id) {
                              onChange(null);
                            } else {
                              onChange(cp.id);
                            }
                          }}
                        />
                      )}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Nút bấm - Cố định ở đáy (Fixed) */}
          <div className="bg-white max-w-[750px] mx-auto px-5 py-4 flex justify-between items-center border-t border-gray-100 pb-8 gap-2 fixed bottom-0 left-0 right-0">
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase mb-1 block">
                {t("services.subtotal")}
              </span>
              <span className="text-xl font-extrabold text-primary-color-2">
                {formatBalance(
                  dataPricing?.final_price || item.service.temp_price,
                )}{" "}
                {t("common.currency")}
              </span>
            </div>

            <button
              type="submit"
              disabled={!!error}
              className={cn(
                "rounded-2xl px-6 py-3.5 flex items-center ",
                !!error ? "bg-gray-400" : "bg-primary-color-2",
              )}
            >
              <span className="text-white font-bold text-base mr-2">
                {t("services.btn_booking")}
              </span>
              <ChevronRight size={18} color="white" />
            </button>
          </div>
        </form>
      </div>

      <ListLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={(loc) => {
          setValue("address", loc.address, { shouldValidate: true });
          setValue("latitude", Number(loc.latitude));
          setValue("longitude", Number(loc.longitude));
          setShowLocationModal(false);
        }}
      />
    </main>
  );
}
