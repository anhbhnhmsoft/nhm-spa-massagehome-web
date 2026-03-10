"use client";

import { BookingItem } from "@/features/booking/types";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  MapPin,
  MessageCircle,
  ImageOff,
  X,
  AlertCircle,
} from "lucide-react"; // Thay đổi icon
import { cn, formatBalance } from "@/lib/utils";
import dayjs from "dayjs";
import {
  _BookingStatus,
  getBookingStatusStyle,
} from "@/features/service/const";
import { useGetRoomChat } from "@/features/chat/hooks";
import Image from "next/image"; // Sử dụng next/image để tối ưu hóa

type Props = {
  item: BookingItem;
  openDetail: (item: BookingItem) => void;
  handleOpenCancelBooking: (id: string) => void;
  getRoomChat: ReturnType<typeof useGetRoomChat>;
  handleOpenReview: (item: BookingItem) => void;
};

export const BookingCard: FC<Props> = ({
  item,
  openDetail,
  handleOpenCancelBooking,
  getRoomChat,
  handleOpenReview,
}) => {
  const { t } = useTranslation();
  const styleStatus = getBookingStatusStyle(item.status);

  return (
    // Sử dụng thẻ <article> hoặc <div> thay cho <Card>
    <div className=" rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* HÀNG 1: THÔNG TIN VÀ TRẠNG THÁI */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image
              src={item.ktv_user.avatar_url || "/default-avatar.png"}
              alt={item.ktv_user.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{item.ktv_user.name}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {item.service.name}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
            style={{
              backgroundColor: styleStatus.background,
              color: styleStatus.text_color,
            }}
          >
            {t(styleStatus.label)}
          </span>
          <p className="font-bold text-blue-600">
            {formatBalance(item.total_price)} {t("common.currency")}
          </p>
        </div>
      </div>

      {/* HÀNG 2: THỜI GIAN & ĐỊA CHỈ */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar size={14} />
          <span className="text-xs">
            {dayjs(item.booking_time).format("DD/MM/YYYY HH:mm")}
          </span>
        </div>
        <div className="flex items-start gap-2 text-slate-600">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          <p className="text-xs line-clamp-1">{item.address}</p>
        </div>
      </div>

      {/* HÀNG 3: ACTION BUTTONS */}
      <div className="flex gap-2">
        {item.status === _BookingStatus.COMPLETED ? (
          <button
            disabled={item.has_reviews}
            onClick={() => handleOpenReview(item)}
            className={cn(
              "flex-1 rounded-lg py-2 text-xs font-bold text-white transition-colors",
              item.has_reviews
                ? "cursor-not-allowed bg-slate-400"
                : "bg-orange-500 hover:bg-orange-600",
            )}
          >
            {item.has_reviews ? t("booking.has_reviews") : t("booking.reviews")}
          </button>
        ) : (
          <button
            onClick={() => getRoomChat({ user_id: item.ktv_user.id })}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700"
          >
            <MessageCircle size={14} />
            {t("booking.inbox")}
          </button>
        )}

        <button
          onClick={() => openDetail(item)}
          className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
        >
          {t("booking.detail")}
        </button>

        {item.status === _BookingStatus.CONFIRMED && (
          <button
            onClick={() => handleOpenCancelBooking(item.id)}
            className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-500"
          >
            {t("common.cancel")}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Modal Component ---

export const BookingDetailModal = ({
  isOpen,
  onClose,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: BookingItem | null;
}) => {
  const { t } = useTranslation();
  const styleStatus = useMemo(() => {
    if (item) {
      return getBookingStatusStyle(item.status);
    }
    return null;
  }, [item]);
  const [imageError, setImageError] = useState(false);
  // Khóa scroll khi mở modal
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {item && styleStatus ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          {/* Overlay click to close */}
          <div className="absolute inset-0" onClick={onClose} />

          <div className="relative flex flex-col h-[90vh] sm:h-[85vh] w-full sm:max-w-xl overflow-hidden rounded-t-[32px] sm:rounded-[24px] bg-white  shadow-2xl">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 shrink-0 flex items-center justify-between border-b bg-white/80 p-5 backdrop-blur-md">
              <h3 className="text-lg font-bold text-slate-800">
                {t("booking.detail_title")}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-24 pt-4 sm:pb-8">
              <div
                className={cn(
                  `mb-6 flex items-center justify-center rounded-2xl py-4 shadow-sm `,
                )}
                style={{ backgroundColor: styleStatus.background }}
              >
                <span
                  className={cn("text-sm font-bold tracking-wide")}
                  style={{ color: styleStatus.text_color }}
                >
                  {t(styleStatus.label)}
                </span>
              </div>

              {/* Technician Section */}
              <section className="mb-8">
                <label className="mb-3 block text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {t("booking.technician")}
                </label>
                <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
                    {item.ktv_user.avatar_url && !imageError ? (
                      <Image
                        src={item.ktv_user.avatar_url}
                        alt="avatar"
                        fill
                        className="object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-200">
                        <ImageOff size={20} />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-base font-bold text-slate-800">
                      {item.ktv_user.name}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      ID: {item.ktv_user.id}
                    </p>
                  </div>
                </div>
              </section>

              {/* Billing Info */}
              <section className="mb-8">
                <label className="mb-3 block text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {t("booking.service_info")}
                </label>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
                  {/* Tên dịch vụ */}
                  <div className="flex justify-between pt-1">
                    <span className="text-sm text-slate-500">
                      {t("booking.service_name")}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {item.service.name}
                    </span>
                  </div>

                  {/* Thời lượng */}
                  <div className="flex justify-between pt-3">
                    <span className="text-sm text-slate-500">
                      {t("booking.duration")}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {item.duration} {t("common.minute")}
                    </span>
                  </div>

                  {/* Giá gốc / Giá hiện tại */}
                  <div className="flex justify-between pt-3">
                    <span className="text-sm text-slate-500">
                      {t("booking.price")}
                    </span>
                    <span className="text-base font-black text-primary-color-1">
                      {formatBalance(item.price)} {t("common.currency")}
                    </span>
                  </div>

                  {/* Hiển thị Coupon nếu có */}
                  {item.coupon && (
                    <>
                      {/* Tên Coupon */}
                      <div className="flex justify-between pt-3">
                        <span className="text-sm text-slate-500">
                          {t("booking.coupon")}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                          {item.coupon.label}
                        </span>
                      </div>

                      {/* Số tiền được giảm */}
                      <div className="flex justify-between pt-3">
                        <span className="text-sm text-slate-500">
                          {t("booking.discount_price")}
                        </span>
                        <span className="text-sm font-bold text-red-500">
                          -
                          {formatBalance(
                            Number(item.price_before_discount) -
                              Number(item.price),
                          )}{" "}
                          {t("common.currency")}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Time & Location */}
              <section className="mb-8 space-y-5">
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {t("booking.time_place")}
                </label>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {dayjs(item.booking_time).format("HH:mm - DD/MM/YYYY")}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {t("booking.booking_time")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                      {item.address}
                    </p>
                    {item.note_address && (
                      <p className="mt-1 text-xs italic text-slate-500">
                        {t("booking.note_address")}: {item.note_address}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Notes */}
              <section className="mb-4">
                <label className="mb-3 block text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {t("booking.note")}
                </label>
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 leading-relaxed italic">
                  {item.note || t("booking.no_desc")}
                </div>
              </section>

              {/* Cancel Reason */}
              {(_BookingStatus.CANCELED === item.status ||
                _BookingStatus.WAITING_CANCEL === item.status) && (
                <section className="mt-6 rounded-xl bg-red-50 p-4 border border-red-100">
                  <p className="text-xs font-bold text-red-600 uppercase mb-1">
                    {t("booking.cancel_reasons")}
                  </p>
                  <p className="text-sm text-red-700">
                    {item.reason_cancel || t("booking.no_cancel_reason")}
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

// component Modal Hủy Đặt Lịch
interface CancelModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export const CancellationModal = ({
  isVisible,
  onClose,
  onConfirm,
  isLoading,
}: CancelModalProps) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  // Reset lý do khi đóng modal

  const handleClose = useCallback(() => {
    onClose();
    setReason("");
  }, [onClose]);

  // Xử lý đóng modal khi nhấn phím Esc
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
      {/* Lớp nền overlay click để đóng */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Nội dung Modal */}
      <div
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-t-[32px] bg-white p-6 shadow-2xl transition-all animate-in slide-in-from-bottom duration-300",
          "sm:rounded-[32px] sm:p-8",
        )}
        onClick={(e) => e.stopPropagation()} // Ngăn đóng modal khi click vào bên trong
      >
        {/* Nút X đóng nhanh cho desktop */}
        <button
          onClick={handleClose}
          className="absolute right-6 top-6 hidden rounded-full p-2 text-slate-400 hover:bg-slate-100 sm:block"
        >
          <X size={20} />
        </button>

        {/* Thanh gạt nhỏ (Indicator) cho mobile */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />

        {/* Header: Icon & Text */}
        <div className="mb-6 mt-2 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-center text-2xl font-bold text-slate-900">
            {t("booking.cancel_reasons")}
          </h3>
          <p className="mt-2 px-4 text-center text-sm leading-relaxed text-slate-500 sm:px-6">
            {t("booking.cancel_pending_note")}
          </p>
        </div>

        {/* Input Area */}
        <div className="mb-8">
          <textarea
            placeholder={t("booking.enter_cancel_reason")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className={cn(
              "w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800 outline-none transition-all",
              "focus:border-red-300 focus:ring-4 focus:ring-red-50",
              "placeholder:text-slate-400",
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="order-2 flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-4 text-base font-semibold text-slate-600 transition-colors hover:bg-slate-200 sm:order-1"
          >
            {t("common.cancel")}
          </button>

          <button
            onClick={() => onConfirm(reason)}
            disabled={isLoading || !reason.trim()}
            className={cn(
              "order-1 flex-1 rounded-2xl py-4 text-base font-bold text-white transition-all sm:order-2",
              isLoading || !reason.trim()
                ? "cursor-not-allowed bg-slate-300 border-transparent"
                : "bg-red-500 hover:bg-red-600 active:scale-[0.98] ",
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t("common.loading")}
              </div>
            ) : (
              t("booking.confirm_cancel")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
