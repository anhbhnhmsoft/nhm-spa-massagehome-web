"use client";

import React, { useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  User,
  Home,
  X,
  DollarSign,
  Bike,
  TicketPercent,
  AlertCircle,
} from "lucide-react";
import DefaultColor from "@/components/styles/color";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { BookingCheckItem } from "@/features/booking/types";
import { formatBalance } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCheckBooking } from "@/features/booking/hooks/use-check-booking";

const ServiceBookingResultScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const resetNav = useCallback(() => {
    router.replace("/");
  }, [router]);

  const { status, data } = useCheckBooking();

  const closeModal = useCallback(() => {
    resetNav();
  }, [resetNav]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header: Chỉ hiện nút Đóng (X) khi KHÔNG PHẢI đang xử lý */}
      {status !== "waiting" && (
        <div className="flex justify-end px-4 pt-2">
          <button
            onClick={closeModal}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>
      )}

      {/* Nội dung chính: Đã đảm bảo flex-1 và flex-col */}
      <div className="flex-1 flex flex-col">
        {status === "waiting" && <Processing t={t} />}
        {status === "confirmed" && data && data.data && (
          <Success t={t} bookingData={data.data} onGoHome={closeModal} />
        )}
        {status === "failed" && data && data.data && (
          <Failed t={t} bookingData={data.data} onGoHome={closeModal} />
        )}
      </div>
    </div>
  );
};

export default ServiceBookingResultScreen;

// 1. Render: Trạng thái Đang Xử Lý (Column Layout)
const Processing = ({ t }: { t: TFunction }) => (
  <div className="flex-1 flex flex-col items-center justify-center px-6">
    <div className="mb-6 rounded-full bg-blue-50 p-4 inline-flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
    </div>
    <h2 className="text-center font-inter-bold text-2xl text-gray-800 mb-2">
      {t("services.booking_processing_title")}
    </h2>
    <p className="text-center text-sm text-gray-500 max-w-xs">
      {t("services.booking_processing_description")}
    </p>
  </div>
);

// 2. Render: Trạng thái Thành công (Column Layout)
const Success = ({
  t,
  bookingData,
  onGoHome,
}: {
  t: TFunction;
  bookingData: BookingCheckItem;
  onGoHome: () => void;
}) => (
  <div className="flex-1 flex flex-col overflow-y-auto pb-24">
    <div className="flex flex-col items-center mb-6 mt-4 text-center px-6">
      <div className="mb-4 rounded-full bg-blue-50 p-4 inline-flex">
        <CheckCircle
          size={80}
          color={DefaultColor.blue["500"]}
          fill={DefaultColor.blue[200]}
        />
      </div>
      <h2 className="font-inter-bold text-2xl text-gray-800">
        {t("services.booking_success_title")}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        {t("services.booking_success_description")}
      </p>
    </div>

    <InfoCard t={t} bookingData={bookingData} />

    {/* Footer cố định */}
    <div className="fixed max-w-[750px] mx-auto bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
      <button
        onClick={onGoHome}
        className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-3 hover:bg-gray-50 transition-colors"
      >
        <Home size={18} className="text-gray-700" />
        <span className="font-inter-bold text-base text-gray-700">
          {t("common.go_to_home")}
        </span>
      </button>
    </div>
  </div>
);

// 3. Render: Trạng thái Thất bại (Column Layout)
const Failed = ({
  t,
  bookingData,
  onGoHome,
}: {
  t: TFunction;
  bookingData: BookingCheckItem;
  onGoHome: () => void;
}) => (
  <div className="flex-1 flex flex-col overflow-y-auto pb-24">
    <div className="flex flex-col items-center mb-6 mt-4 text-center px-6">
      <div className="mb-4 rounded-full bg-red-50 p-4 inline-flex">
        <XCircle
          size={80}
          color={DefaultColor.red[500]}
          fill={DefaultColor.red[100]}
        />
      </div>
      <h2 className="font-inter-bold text-2xl text-gray-800">
        {t("services.booking_failed_title")}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        {t("services.booking_failed_message")}
      </p>
    </div>

    <InfoCard t={t} bookingData={bookingData} />

    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
      <button
        onClick={onGoHome}
        className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-3 hover:bg-gray-50 transition-colors"
      >
        <Home size={18} className="text-gray-700" />
        <span className="font-inter-bold text-base text-gray-700">
          {t("common.go_to_home")}
        </span>
      </button>
    </div>
  </div>
);

// 4. Render: Thông tin đặt lịch (Tối ưu Padding và Reason Cancel)
const InfoCard = ({
  t,
  bookingData,
}: {
  t: TFunction;
  bookingData: BookingCheckItem;
}) => (
  <div className="w-full px-4">
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 flex flex-col">
      <div className="mb-3 flex justify-between items-center border-b border-dashed border-gray-200 pb-3">
        <span className="text-xs text-gray-500">
          {t("services.booking_id")}
        </span>
        <span className="font-inter-bold text-sm text-gray-800">
          {bookingData.booking_id}
        </span>
      </div>

      {/* Phần Reason Cancel được sửa lại cho đẹp */}
      {!!bookingData.reason_cancel && (
        <div className="bg-red-50 border border-red-100 mb-4 p-3 rounded-xl flex items-start">
          <div className="bg-red-100 p-1.5 rounded-full mr-3 shrink-0">
            <AlertCircle
              size={16}
              color={DefaultColor.red[500]}
              strokeWidth={2.5}
            />
          </div>
          <div className="flex-1 text-red-600 text-[13px] font-inter-italic leading-5">
            {bookingData.reason_cancel}
          </div>
        </div>
      )}

      <h3 className="mb-4 font-inter-bold text-lg text-primary-color-1">
        {bookingData.service_name}
      </h3>

      <div className="space-y-4">
        {[
          {
            icon: <User size={16} />,
            label: t("services.booking_technician"),
            value: bookingData.technician,
          },
          {
            icon: <Calendar size={16} />,
            label: t("services.booking_date"),
            value: bookingData.date,
          },
          {
            icon: <MapPin size={16} />,
            label: t("services.booking_location"),
            value: bookingData.location,
          },
          {
            icon: <DollarSign size={16} />,
            label: t("services.service_price"),
            value: `${formatBalance(bookingData.price || 0)} ${t("common.currency")}`,
          },
          {
            icon: <Bike size={16} />,
            label: t("services.distance_price"),
            value: `${formatBalance(bookingData.price_transportation || 0)} ${t("common.currency")}`,
          },
          {
            icon: <TicketPercent size={16} />,
            label: t("services.discount"),
            value: `${formatBalance(bookingData.price_discount || 0)} ${t("common.currency")}`,
          },
        ].map((item, idx) => (
          <div key={idx} className="flex items-start">
            <div className="mt-0.5 text-primary-color-1">{item.icon}</div>
            <div className="ml-3 flex-1 flex justify-between gap-2">
              <span className="text-sm text-gray-500">{item.label}</span>
              <span className="text-right font-inter-medium text-sm text-gray-800">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
        <span className="font-inter-medium text-gray-600">
          {t("services.booking_total_price")}
        </span>
        <span className="font-inter-bold text-xl text-primary-color-1">
          {formatBalance(bookingData.total_price || 0)} {t("common.currency")}
        </span>
      </div>
    </div>
  </div>
);
