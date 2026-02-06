import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  Calendar,
  ImageOff,
  MapPin,
  X,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { BookingItem } from "@/features/booking/types";
import {
  _BookingStatus,
  _BookingStatusMap,
  getStatusColor,
} from "@/features/service/const";
import { formatBalance, cn } from "@/lib/utils";
import Image from "next/image";
import { ReviewModal } from "./review-modal";
import { useGetRoomChat } from "@/features/chat/hooks";

// --- Components chính ---

export const BookingCard = ({
  item,
  onRefresh,
  cancelBooking,
}: {
  item: BookingItem;
  onRefresh: () => void;
  cancelBooking: (bookingId: string) => void;
}) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const getRoomChat = useGetRoomChat();

  return (
    <>
      {/* Card Container */}
      <div className="group mb-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md md:p-5">
        {/* Header Info */}
        <div className="mb-4 flex flex-row items-center gap-3 md:gap-4">
          {/* Avatar */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 md:h-14 md:w-14">
            {item.ktv_user.avatar_url && !imageError ? (
              <Image
                src={item.ktv_user.avatar_url}
                alt="avatar"
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
                fill
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff size={20} className="text-slate-400" />
              </div>
            )}
          </div>

          {/* Name & Service */}
          <div className="flex-1 min-w-0">
            <h4 className="truncate text-base font-bold text-slate-800 md:text-lg">
              {item.ktv_user.name}
            </h4>
            <p className="truncate text-xs text-slate-500 md:text-sm">
              {item.service.name}
            </p>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-bold text-blue-600 md:text-base whitespace-nowrap">
              {formatBalance(item.price)} {t("common.currency")}
            </p>
          </div>
        </div>

        {/* Details Row */}
        <div className="mb-5 grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
          <div className="flex items-center text-slate-600">
            <Calendar size={14} className="mr-2 shrink-0" />
            <span className="text-[13px] md:text-sm">
              {dayjs(item.booking_time).format("DD/MM/YYYY HH:mm")}
            </span>
          </div>
          <div className="flex items-start text-slate-600">
            <MapPin size={14} className="mr-2 mt-0.5 shrink-0" />
            <span
              className="truncate text-[13px] md:text-sm"
              title={item.address}
            >
              {item.address}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 md:flex-nowrap">
          {item.status === _BookingStatus.COMPLETED ? (
            <button
              disabled={item.has_reviews}
              onClick={() => setShowReviewModal(true)}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-xs font-bold text-white transition-all active:scale-95 md:text-sm",
                item.has_reviews
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 shadow-orange-100",
              )}
            >
              {item.has_reviews
                ? t("booking.has_reviews")
                : t("booking.reviews")}
            </button>
          ) : (
            <button
              onClick={() => getRoomChat({ user_id: item.ktv_user.id })}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-700 active:scale-95 md:text-sm"
            >
              <MessageCircle size={14} />
              {t("booking.inbox")}
            </button>
          )}

          <button
            onClick={() => setShowDetailModal(true)}
            className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-95 md:text-sm"
          >
            {t("booking.detail")}
          </button>

          {item.status === _BookingStatus.CONFIRMED && (
            <button
              onClick={() => cancelBooking(item.id)}
              className="flex-1 rounded-xl border border-red-100 bg-white py-2.5 text-xs font-bold text-red-500 transition-all hover:bg-red-50 active:scale-95 md:text-sm"
            >
              {t("common.cancel")}
            </button>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <BookingDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={item}
      />
      {/* Review Modal */}
      <ReviewModal
        isVisible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        serviceBookingId={item.id}
        onSuccess={() => {
          setShowReviewModal(false);
          onRefresh();
        }}
      />
    </>
  );
};

// --- Modal Component ---

const BookingDetailModal = ({
  isOpen,
  onClose,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: BookingItem;
}) => {
  const { t } = useTranslation();
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

  const statusStyle = getStatusColor(item.status);
  return (
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
              `mb-6 flex items-center justify-center rounded-2xl py-4 shadow-sm ${statusStyle.split(" ")[0]}`,
            )}
          >
            <span
              className={cn(
                "text-sm font-bold tracking-wide",
                statusStyle.split(" ")[1],
              )}
            >
              {t(_BookingStatusMap[item.status])}
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
                        Number(item.price_before_discount) - Number(item.price),
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
