import React, { useMemo, useState } from "react";
import Image from "next/image"; // Dùng Image của Next.js
import { Clock, ImageOff, User } from "lucide-react"; // Lucide cho Web
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

// Giữ nguyên các import từ dự án của bạn
import { KTVDetail, KTVWorkSchedule } from "@/features/user/types";
import { ServiceItem } from "@/features/service/types";
import { cn, formatBalance, getCurrentDayKey } from "@/lib/utils";
import DefaultColor from "@/components/styles/color";
import StarRating from "../star-rating";
import Empty from "../emty";
import { useSetService } from "@/features/service/hooks";
import { _KTVConfigSchedulesLabel } from "@/lib/const";
// Đảm bảo component Icon này hỗ trợ Web

// 1. Hiển thị ảnh của KTV với xử lý lỗi ảnh
export const ImageDisplayCustomer = ({ source }: { source: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !source) {
    return (
      <div
        style={{ width: "100%", height: "100%" }}
        className="flex items-center justify-center bg-gray-200"
      >
        <ImageOff size={32} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Image
        src={source}
        alt="Customer"
        fill
        sizes="(max-width: 750px) 100vw, 750px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

// 2. Hiển thị ảnh đại diện của KTV với xử lý lỗi ảnh
export const AvatarKTV = ({ source }: { source: string | null }) => {
  const [imageError, setImageError] = useState(false);

  const containerStyle = {
    width: 60,
    height: 60,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: DefaultColor.base["primary-color-1"],
    position: "relative" as const,
    overflow: "hidden" as const,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  if (!source || imageError) {
    return (
      <div style={containerStyle}>
        <User size={24} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Image
        src={source}
        alt="Avatar"
        fill
        sizes="60px"
        className="object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

// 3. Hiển thị đánh giá đầu tiên của KTV
export const ReviewFistItem = ({
  item,
}: {
  item: KTVDetail["first_review"];
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="mt-1 flex flex-row items-center justify-center w-full">
      {item ? (
        <>
          <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-full">
            {item.review_by.avatar_url && !imageError ? (
              <Image
                src={item.review_by.avatar_url}
                alt="Reviewer"
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: DefaultColor.slate[200] }}
              >
                <User size={14} className="text-slate-400" />
              </div>
            )}
          </div>
          <div className="ml-3 flex-1 flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <span className="font-bold text-xs text-gray-700">
                {item.review_by.name}
              </span>
              <span className="text-[10px] text-gray-400">
                {dayjs(item.created_at).format("DD/MM/YYYY")}
              </span>
            </div>
            <StarRating rating={item.rating} size={10} />
            <p className="mb-2 text-xs text-gray-600 line-clamp-2">
              {item.comment}
            </p>
          </div>
        </>
      ) : (
        <Empty />
      )}
    </div>
  );
};

// 4. Hiển thị thông tin dịch vụ (Card)
export const ServiceCard = ({ item }: { item: ServiceItem }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const setService = useSetService();

  const minPrice = useMemo(() => {
    const min = item.options.reduce(
      (acc, option) => Math.min(acc, Number(option.price)),
      Number(item.options[0].price),
    );
    return min.toFixed(2);
  }, [item.options]);

  return (
    <button
      disabled={!item.is_active}
      onClick={() => setService(item.id)}
      className="flex flex-row border-b border-gray-100 pb-4 w-full text-left bg-transparent"
    >
      <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-200">
        {item.image_url && !imageError ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff size={24} className="text-slate-400" />
          </div>
        )}
      </div>

      <div className="ml-3 flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex flex-row justify-between">
            <h3 className="flex-1 pr-2 font-bold text-base text-gray-800 truncate">
              {item.name}
            </h3>
          </div>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            {item.description}
          </p>
          <div className="mt-1 flex flex-row items-center justify-between">
            <span className="text-[10px] text-orange-500">
              {t("masseurs_detail.sales_count_item_service", {
                count: item.bookings_count,
              })}
            </span>
            <div
              className={cn("rounded-full px-2 py-0.5", {
                "bg-primary-color-2": item.is_active,
                "bg-red-500": !item.is_active,
              })}
            >
              <span className="font-semibold text-[10px] text-white">
                {item.is_active
                  ? t("masseurs_detail.available")
                  : t("masseurs_detail.unavailable")}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-row items-baseline gap-1 text-primary-color-1">
          <span className="font-bold text-xs">
            {t("masseurs_detail.price_service_sub")}
          </span>
          <span className="font-bold text-lg">{formatBalance(minPrice)}</span>
          <span className="font-bold text-xs">{t("common.currency")}</span>
        </div>
      </div>
    </button>
  );
};

/**
 * Hiển thị thông tin lịch làm việc của massager (Web version)
 */
export const ScheduleSection = ({
  schedule,
  isOnlineRealtime,
}: {
  schedule: KTVWorkSchedule;
  isOnlineRealtime: boolean;
}) => {
  const { t } = useTranslation();
  const currentDayKey = getCurrentDayKey();

  // Sắp xếp lịch để hiển thị từ Thứ 2 -> CN
  const sortedSchedule = useMemo(() => {
    return [...(schedule?.schedule_time || [])].sort(
      (a, b) => a.day_key - b.day_key,
    );
  }, [schedule]);

  if (!schedule) return null;

  return (
    <div className="mt-2 bg-white px-4 py-4">
      {/* Header Section */}
      <div className="mb-3 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          {/* Icon Đồng hồ */}
          <Clock size={20} className="text-primary-color-2" />
          <h3 className="font-bold text-base text-gray-800">
            {t("masseurs_detail.working_hours")}
          </h3>
        </div>

        {/* Badge Trạng thái hiện tại */}
        <div
          className={cn(
            "rounded-md px-2 py-1",
            isOnlineRealtime ? "bg-green-100" : "bg-gray-100",
          )}
        >
          <span
            className={cn(
              "text-xs",
              isOnlineRealtime ? "font-bold text-green-700" : "text-gray-500",
            )}
          >
            {isOnlineRealtime ? t("common.online") : t("common.offline")}
          </span>
        </div>
      </div>

      {/* List Lịch */}
      <div className="rounded-xl bg-gray-50 p-3">
        {sortedSchedule.map((item, index) => {
          const isToday = item.day_key === currentDayKey;

          return (
            <div
              key={item.day_key}
              className={cn(
                "flex flex-row items-center justify-between py-2",
                index !== sortedSchedule.length - 1
                  ? "border-b border-dashed border-gray-200"
                  : "",
              )}
            >
              {/* Cột Thứ */}
              <div className="flex flex-row items-center gap-2">
                {isToday && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-color-2" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    isToday
                      ? "font-bold text-primary-color-2"
                      : "text-gray-700",
                  )}
                >
                  {t(
                    _KTVConfigSchedulesLabel[
                      item.day_key as keyof typeof _KTVConfigSchedulesLabel
                    ],
                  )}
                </span>
              </div>

              {/* Cột Giờ */}
              <div>
                {item.active ? (
                  <span
                    className={cn(
                      "text-sm",
                      isToday
                        ? "font-bold text-primary-color-2"
                        : "text-gray-700",
                    )}
                  >
                    {item.start_time} - {item.end_time}
                  </span>
                ) : (
                  <span className="italic text-sm text-gray-400">
                    {t("common.day_off")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
