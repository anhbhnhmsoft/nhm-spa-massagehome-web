"use client";

import React, { useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Home,
  X,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { cn, formatBalance } from "@/lib/utils";
import { useCheckBooking } from "@/features/booking/hooks";
import { BookingCheckItem } from "@/features/booking/types";

// Render: Trạng thái Đang Xử Lý
const Processing = ({ t }: { t: any }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] px-8 text-center">
    <div className="mb-6">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
    <h2 className="mb-2 text-xl font-bold text-gray-800">
      {t("services.booking_processing_title")}
    </h2>
    <p className="text-gray-500 leading-relaxed">
      {t("services.booking_processing_description")}
    </p>
  </div>
);

// Render: Trạng thái Thành công
const Success = ({
  t,
  bookingData,
  onGoHome,
}: {
  t: any;
  bookingData: BookingCheckItem;
  onGoHome: () => void;
}) => (
  <div className="flex flex-col h-full">
    <div className="flex-1 overflow-y-auto px-6 pb-24">
      {/* Hero Success */}
      <div className="flex flex-col items-center mb-8 mt-4">
        <div className="mb-4 rounded-full bg-blue-50 p-6">
          <CheckCircle className="h-16 w-16 text-blue-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-center font-bold text-2xl text-gray-800">
          {t("services.booking_success_title")}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          {t("services.booking_success_description")}
        </p>
      </div>

      {/* Info Card */}
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between border-b border-dashed border-gray-200 pb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {t("services.booking_id")}
            </span>
            <span className="font-bold text-sm text-gray-800">
              #{bookingData.booking_id}
            </span>
          </div>

          <h3 className="mb-4 font-bold text-lg text-blue-600">
            {bookingData.service_name}
          </h3>

          <div className="space-y-4">
            <InfoRow
              icon={<User size={18} />}
              label={t("services.booking_technician")}
              value={bookingData.technician}
            />
            <InfoRow
              icon={<Calendar size={18} />}
              label={t("services.booking_date")}
              value={bookingData.date}
            />
            <InfoRow
              icon={<MapPin size={18} />}
              label={t("services.booking_location")}
              value={bookingData.location}
            />
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <span className="font-medium text-gray-600">
              {t("services.booking_total_price")}
            </span>
            <span className="font-bold text-xl text-blue-600">
              {formatBalance(bookingData.total_price)} {t("common.currency")}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Footer Actions */}
    <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
      <button
        onClick={onGoHome}
        className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-3.5 px-6 hover:bg-gray-50 transition-colors font-bold text-gray-700 shadow-sm"
      >
        <Home size={18} />
        {t("common.go_to_home")}
      </button>
    </div>
  </div>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start">
    <div className="text-blue-600 mt-0.5">{icon}</div>
    <div className="ml-3 flex flex-1 justify-between gap-4">
      <span className="text-sm text-gray-500 whitespace-nowrap">{label}</span>
      <span className="text-right font-medium text-sm text-gray-800 leading-tight">
        {value}
      </span>
    </div>
  </div>
);

// Render: Trạng thái Thất bại
const Failed = ({ t, onGoHome }: { t: any; onGoHome: () => void }) => (
  <div className="flex flex-col items-center px-6 pt-12 text-center h-full">
    <div className="mb-6 rounded-full bg-red-50 p-6">
      <XCircle className="h-16 w-16 text-red-500" strokeWidth={1.5} />
    </div>
    <h2 className="text-2xl font-bold text-gray-800">
      {t("services.booking_failed_title")}
    </h2>
    <p className="mt-3 text-gray-500 max-w-xs leading-relaxed">
      {t("services.booking_failed_message")}
    </p>

    <div className="mt-10 w-full max-w-xs space-y-3">
      <button
        onClick={onGoHome}
        className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-3.5 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Home size={18} />
        {t("common.go_to_home")}
      </button>
    </div>
  </div>
);

interface Props {
  isVisible: boolean;
  bookingId: string | null;
  onClose: () => void;
}

export default function BookingResultModal({
  isVisible,
  bookingId,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { status, data } = useCheckBooking(bookingId);

  // Khóa scroll khi modal mở
  useEffect(() => {
    if (isVisible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed m-auto w-full max-w-[750px] inset-0 z-[100] flex flex-col bg-white">
      {/* Header */}
      <div className="flex h-16 items-center justify-end px-4 shrink-0">
        {status !== "waiting" && (
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {status === "waiting" && <Processing t={t} />}

        {status === "confirmed" && data?.data && (
          <Success
            t={t}
            bookingData={data.data}
            onGoHome={() => router.push("/")}
          />
        )}

        {status === "failed" && (
          <Failed t={t} onGoHome={() => router.push("/")} />
        )}
      </div>
    </div>
  );
}
