"use client";

import React, {
  useMemo,
  useState,
  useTransition as useReactTransition,
} from "react";
import { useTranslation } from "react-i18next";
import { useServiceBooking } from "@/features/service/hooks";
import {
  ChevronRight,
  MapPin,
  X,
  RotateCw,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useWatch } from "react-hook-form";
import {
  calculateDiscountAmount,
  calculatePriceDistance,
  cn,
  formatBalance,
  formatDistance,
  getDistanceFromLatLonInKm,
} from "@/lib/utils";
import DateTimePickerInput from "@/components/app/date-time-input";
import { ListLocationModal } from "@/components/location";
import BookingResultModal from "@/components/app/booking-complete";
import { CouponCardBooking } from "@/components/app/coupon-card";
import { CouponItem, PrepareBookingResponse } from "@/features/service/types";
import { TFunction } from "i18next";
import dayjs from "dayjs";

export default function ServiceBookingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useReactTransition(); // Next.js transition cho navigation
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [coupon, setCoupon] = useState<CouponItem | null>(null);
  const {
    detail: item,
    form,
    queryCoupon,
    handleBooking,
    showSuccessModal,
    setShowSuccessModal,
    bookingId,
  } = useServiceBooking();

  const {
    control,
    formState: { errors, isSubmitting },
    setValue,
    handleSubmit,
    getValues,
  } = form;

  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  // Memoize khoảng cách để tránh re-render thừa
  const distance = useMemo(() => {
    if (
      latitude == null ||
      longitude == null ||
      latitude === 0 ||
      longitude === 0 ||
      !item?.location_ktv
    ) {
      return 0;
    }

    return getDistanceFromLatLonInKm(
      latitude,
      longitude,
      item.location_ktv.latitude,
      item.location_ktv.longitude,
    );
  }, [latitude, longitude, item]);

  // Tính toán giá trị tạm tính (giá gốc + cước di chuyển)
  const tempTotalPrice = useMemo(() => {
    let subTotalPrice = 0;
    const price = Number(item?.option.price);
    const priceTransportation = calculatePriceDistance(
      item.price_transportation,
      distance,
    );

    subTotalPrice = price + priceTransportation;

    return subTotalPrice;
  }, [item, distance]);

  // Tính toán giá trị giảm giá
  const discountAmount = useMemo(() => {
    if (coupon) {
      return calculateDiscountAmount(tempTotalPrice, coupon);
    }
    return 0;
  }, [tempTotalPrice, coupon]);

  // Tính toán giá trị cuối cùng (tạm tính - giảm giá)
  const finalTotalPrice = useMemo(() => {
    return tempTotalPrice - discountAmount;
  }, [tempTotalPrice, discountAmount]);

  const onGoBack = () => {
    startTransition(() => {
      router.back();
    });
  };

  return (
    // Max-w-md giúp app trông như mobile app trên màn hình Desktop
    <main className="relative min-h-screen bg-white flex flex-col w-full  mx-auto border-x shadow-sm">
      {/* ProgressBar cho Next.js Navigation (giả lập hoặc dùng library) */}
      {isPending && (
        <div className="fixed top-0 left-0 h-1 bg-blue-500 animate-pulse z-50 w-full" />
      )}

      <div className="flex-1 flex flex-col px-5 pb-28 pt-6">
        {/* Header - Sử dụng Sticky để user luôn thấy thông tin dịch vụ khi scroll */}
        <header className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 sticky top-0 bg-white z-10">
          <div className="space-y-1 overflow-hidden">
            <h1 className="font-bold text-gray-900 text-lg leading-tight">
              {t("services.booking_title")}
            </h1>

            {item && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-2">
                <p className="text-sm font-medium text-blue-600 truncate">
                  {item?.service.name}
                </p>
                <p className="text-xs font-semibold text-gray-500">
                  {formatBalance(item.option.price)} {t("common.currency")} •{" "}
                  {item?.option.duration} {t("common.minute")}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onGoBack}
            className="rounded-full bg-gray-50 p-2.5 text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        {/* Form chính */}
        <form
          onSubmit={handleSubmit(handleBooking)}
          className="flex flex-1 flex-col space-y-7"
        >
          {/* Lịch làm việc của KTV */}
          <section aria-labelledby="schedule-title">
            <KTVSchedule data={item} t={t} />
          </section>

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
                    "flex cursor-pointer items-center rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-4 transition-all hover:border-blue-400 active:scale-[0.98]",
                    errors.address && "border-red-300 bg-red-50/30",
                  )}
                >
                  <div className="mr-3 rounded-xl bg-white p-2 text-blue-600 shadow-sm">
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
              {t("services.note_address")}
            </label>
            <Controller
              control={control}
              name="note_address"
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  placeholder={t("common.optional_note")}
                  className={cn(
                    "w-full resize-none rounded-2xl border border-gray-100 bg-gray-50/30 px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                    errors.note_address && "border-red-500",
                  )}
                />
              )}
            />
          </div>

          {/* Thời gian đặt lịch */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              {t("services.book_time")} *
            </label>
            <Controller
              control={control}
              name="book_time"
              render={({ field: { value, onChange } }) => (
                <div className="grid grid-cols-2 gap-4">
                  <DateTimePickerInput
                    mode="date"
                    value={value ? new Date(value) : new Date()}
                    onChange={(d) => {
                      const current = new Date(value || new Date());
                      current.setFullYear(
                        d.getFullYear(),
                        d.getMonth(),
                        d.getDate(),
                      );
                      onChange(current.toISOString());
                    }}
                  />
                  <DateTimePickerInput
                    mode="time"
                    value={value ? new Date(value) : new Date()}
                    onChange={(t) => {
                      const current = new Date(value || new Date());
                      current.setHours(t.getHours(), t.getMinutes(), 0, 0);
                      onChange(current.toISOString());
                    }}
                  />
                </div>
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
                className="text-xs font-bold text-blue-600 flex items-center gap-1 active:opacity-60"
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
                              setCoupon(null);
                            } else {
                              onChange(cp.id);
                              setCoupon(cp);
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
          <div className=" p-5 bg-white w-full border-t border-gray-50 max-w-xl mx-auto z-20">
            <div className="flex flex-row justify-between mb-2">
              <span className="text-gray-500 text-sm">
                {t("services.distance")}
              </span>
              <span className="text-gray-800 text-sm font-medium">
                {formatDistance(distance)}
              </span>
            </div>

            {/* Cước di chuyển */}
            <div className="flex flex-row justify-between mb-2">
              <span className="text-gray-500 text-sm">
                {t("services.distance_price")}
              </span>
              <span className="text-gray-800 text-sm font-medium">
                {formatBalance(item?.price_transportation)}{" "}
                {t("common.currency")}
              </span>
            </div>

            {/* Giảm giá */}
            <div className="flex flex-row justify-between mb-2">
              <span className="text-gray-500 text-sm">
                {t("services.discount")}
              </span>
              <span className="text-gray-800 text-sm font-medium">
                {formatBalance(discountAmount)} {t("common.currency")}
              </span>
            </div>

            {/* Chi tiết giá (Thành tiền) */}
            <div className="flex flex-row justify-between mb-2">
              <span className="text-gray-500 text-sm">
                {t("services.subtotal")}
              </span>
              <span className="text-gray-800 text-sm font-medium">
                {formatBalance(finalTotalPrice)} {t("common.currency")}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex h-14 w-full items-center mt-4 justify-center gap-2 rounded-2xl bg-primary-color-2 text-lg font-bold text-white",
                isSubmitting && "opacity-70 grayscale",
              )}
            >
              {isSubmitting ? (
                <RotateCw className="animate-spin" />
              ) : (
                t("services.btn_booking")
              )}
              {!isSubmitting && <ChevronRight size={22} />}
            </button>
          </div>
        </form>
      </div>

      <ListLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={(loc: any) => {
          setValue("address", loc.address, { shouldValidate: true });
          setValue("latitude", Number(loc.latitude));
          setValue("longitude", Number(loc.longitude));
          setShowLocationModal(false);
        }}
      />

      <BookingResultModal
        bookingId={bookingId}
        isVisible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </main>
  );
}

// Sub-component tối ưu hóa bằng React.memo
const KTVSchedule = React.memo(
  ({ data, t }: { data?: PrepareBookingResponse["data"]; t: TFunction }) => {
    if (!data) return null;

    return (
      <div className="bg-gray-50 rounded-[24px] p-5 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" />
            {t("services.booking_today")}
          </h3>
        </div>

        {data.bookings.length > 0 ? (
          <div className="space-y-3">
            {data.bookings.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center bg-white p-3 rounded-xl shadow-sm border border-gray-50"
              >
                <div className="bg-blue-50/50 px-3 py-1.5 rounded-lg flex items-center gap-2 mr-4">
                  <Clock size={14} className="text-blue-600" />
                  <span className="text-blue-700 font-bold text-sm">
                    {dayjs(item.booking_time).format("HH:mm")}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700 leading-none">
                    {t("services.busy_slot")}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                    {t("services.confirmed")}
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
              </div>
            ))}
            <p className="text-[11px] text-gray-400 text-center italic mt-2">
              * {t("services.booking_conflict", { min: data.break_time_gap })}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm font-bold text-green-600">
              {t("services.booking_empty")}
            </p>
            <p className="text-[11px] text-green-500/70 mt-0.5">
              {t("services.booking_empty_2")}
            </p>
          </div>
        )}
      </div>
    );
  },
);

KTVSchedule.displayName = "KTVSchedule";
