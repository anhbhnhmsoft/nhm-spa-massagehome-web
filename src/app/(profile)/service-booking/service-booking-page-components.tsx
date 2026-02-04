"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useServiceBooking } from "@/features/service/hooks";
import { ChevronRight, MapPin, X, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { cn, formatBalance } from "@/lib/utils";
import DateTimePickerInput from "@/components/app/date-time-input";
import { ListLocationModal } from "@/components/location";
import BookingResultModal from "@/components/app/booking-complete";
import { CouponCardBooking } from "@/components/app/coupon-card";
import { CouponItem } from "@/features/service/types";

export default function ServiceBooking() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showLocationModal, setShowLocationModal] = useState(false);

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
    formState: { errors },
    setValue,
    handleSubmit,
  } = form;

  return (
    <main className="relative min-h-screen bg-white flex flex-col w-full mx-auto border-x shadow-sm">
      <div className="flex-1 flex flex-col px-5 pb-8 pt-6">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <h1 className="font-bold text-gray-900 text-lg">
              {t("services.booking_title")}
            </h1>

            {item && (
              <>
                <p className="text-sm font-medium text-primary-color-1 truncate">
                  {item.service_name}
                </p>
                <p className="text-sm font-medium  text-primary-color-2 truncate">
                  {formatBalance(item.price)} {t("common.currency")} –{" "}
                  {item.duration} {t("common.minute")}
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleBooking)}
          className="flex flex-1 flex-col space-y-6"
        >
          {/* Address */}
          <Controller
            control={control}
            name="address"
            render={({ field: { value } }) => (
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm text-gray-700">
                  {t("services.address")} *
                </label>

                <div
                  onClick={() => setShowLocationModal(true)}
                  className="flex cursor-pointer items-center rounded-xl border border-gray-200 px-4 py-4 hover:border-blue-300"
                >
                  <div className="mr-3 rounded-full bg-blue-100 p-2 text-blue-600">
                    <MapPin size={20} />
                  </div>

                  {value ? (
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  ) : (
                    <p className="text-sm text-gray-400">
                      {t("location.placeholder_address")}
                    </p>
                  )}
                </div>

                {errors.address && (
                  <span className="text-xs text-red-500">
                    {errors.address.message as string}
                  </span>
                )}
              </div>
            )}
          />

          {/* Note Address */}
          <Controller
            control={control}
            name="note_address"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("services.note_address")}
                </label>

                <textarea
                  {...field}
                  rows={4}
                  placeholder={t("common.optional_note")}
                  className={cn(
                    "w-full resize-none rounded-2xl border px-4 py-3 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    errors.note_address && "border-red-500",
                  )}
                />
              </div>
            )}
          />

          {/* Book time */}
          <Controller
            control={control}
            name="book_time"
            render={({ field: { value, onChange } }) => {
              const dateValue = value ? new Date(value) : new Date();

              return (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("services.book_time")} *
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <DateTimePickerInput
                      mode="date"
                      value={value ? new Date(value) : new Date()}
                      onChange={(newDate) => {
                        const temp = new Date(dateValue);
                        temp.setFullYear(newDate.getFullYear());
                        temp.setMonth(newDate.getMonth());
                        temp.setDate(newDate.getDate());
                        onChange(temp.toISOString());
                      }}
                    />
                    <DateTimePickerInput
                      mode="time"
                      value={value ? new Date(value) : new Date()}
                      onChange={(newTime) => {
                        const temp = new Date(dateValue);
                        temp.setHours(newTime.getHours());
                        temp.setMinutes(newTime.getMinutes());
                        temp.setSeconds(0);
                        temp.setMilliseconds(0);
                        onChange(temp.toISOString());
                      }}
                    />
                  </div>

                  {errors.book_time && (
                    <span className="text-xs text-red-500">
                      {errors.book_time.message as string}
                    </span>
                  )}
                </div>
              );
            }}
          />

          {/* Coupon */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t("common.coupon")}
              </label>

              <button
                type="button"
                onClick={() => queryCoupon.refetch()}
                className="flex items-center gap-1 text-xs font-medium text-blue-600"
              >
                {queryCoupon.isRefetching ? (
                  <RotateCw size={14} className="animate-spin" />
                ) : (
                  <>{t("common.refresh")} ↻</>
                )}
              </button>
            </div>

            <Controller
              control={control}
              name="coupon_id"
              render={({ field: { value, onChange } }) => (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {queryCoupon.isLoading && !queryCoupon.isRefetching ? (
                    <div className="w-full py-4 text-center text-sm">
                      Loading...
                    </div>
                  ) : (queryCoupon.data || []).length > 0 ? (
                    queryCoupon.data!.map((cp: CouponItem) => (
                      <CouponCardBooking
                        key={cp.id}
                        item={cp}
                        isSelected={form.getValues("coupon_id") === cp.id}
                        onPress={() => {
                          if (value === cp.id) {
                            onChange(null);
                          } else {
                            onChange(cp.id);
                          }
                        }}
                      />
                    ))
                  ) : (
                    <div className="w-full rounded-xl border-2 border-dashed py-6 text-center text-sm text-gray-400">
                      {t("services.no_coupon_available")}
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Submit */}
          <div className="mt-auto pt-8">
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary-color-2 text-lg font-bold text-white shadow-sm"
            >
              {t("services.btn_booking")}
              <ChevronRight size={24} />
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <ListLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={(loc: any) => {
          setValue("address", loc.address);
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
