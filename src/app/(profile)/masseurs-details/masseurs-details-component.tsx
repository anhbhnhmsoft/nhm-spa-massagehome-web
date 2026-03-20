"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, Star } from "lucide-react"; // Bản cho Web
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useTranslation } from "react-i18next";
import useCalculateDistance from "@/features/app/hooks/use-calculate-distance";
import {
  calculatePriceDistance,
  formatBalance,
  getCurrentDayKey,
} from "@/lib/utils";
import { _GenderMap } from "@/features/auth/const";
import { useGetRoomChat } from "@/features/chat/hooks";
import {
  AvatarKTV,
  ImageDisplayCustomer,
  ReviewFistItem,
  ScheduleSection,
  ServiceCard,
} from "@/components/app/masseurs-details";
import Empty from "@/components/emty";
import ReviewListModal from "@/components/app/list-reviews";
import { useRouter } from "next/navigation";
import { useDetailKtv } from "@/features/user/hooks/use-detail-ktv";
import ServicesModal from "@/components/app/services-bottom-sheet";
dayjs.extend(isBetween);

const MasseurDetailScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    detail,
    isServiceModalVisible,
    serviceData,
    handleOpenServiceSheet,
    handleDismissServiceSheet,
    handlePrepareBooking,
  } = useDetailKtv();

  // Trạng thái cho Carousel (Web)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showReviewList, setShowReviewList] = useState(false);

  const calculateDistance = useCalculateDistance();
  const getRoomChat = useGetRoomChat();

  // Logic tính khoảng cách (Giữ nguyên)
  const distance = useMemo(() => {
    const lat = detail?.location?.latitude;
    const lon = detail?.location?.longitude;

    if (!lat || !lon || lat === 0 || lon === 0) {
      return null;
    }

    return calculateDistance(lat, lon);
  }, [detail, calculateDistance]);

  // Tính giá tiền di chuyển tạm thời
  const priceTransportation = useMemo(() => {
    if (detail && distance) {
      return calculatePriceDistance(detail.price_transportation, distance);
    }
    return null;
  }, [detail, distance]);

  // Kiểm tra xem KTV có đang làm việc trong thời gian hiện tại không

  const currentDayKey = getCurrentDayKey();

  const isOnlineRealtime = useMemo(() => {
    if (!detail?.schedule?.is_working) return false;
    const todayConfig = detail.schedule?.schedule_time?.find(
      (item: any) => item.day_key === currentDayKey,
    );
    if (!todayConfig || !todayConfig.active) return false;

    const now = dayjs();
    const start = dayjs(todayConfig.start_time, "HH:mm");
    const end = dayjs(todayConfig.end_time, "HH:mm");
    return now.isBetween(start, end, null, "[]");
  }, [detail, currentDayKey]);
  if (!detail) return null;

  return (
    <div className="min-h-screen w-full  bg-[#f4f4f4] ">
      <div className="mx-auto w-full  bg-[#f4f4f4] shadow-lg min-h-screen relative">
        {/* --- HEADER CAROUSEL (Web Version) --- */}
        <div className="relative w-full aspect-[1/1.2] bg-gray-200">
          {/* Đơn giản hóa Carousel bằng cách hiển thị ảnh hiện tại */}
          <div className="relative w-full h-full">
            <ImageDisplayCustomer
              source={detail.display_image[currentIndex]?.url}
            />
          </div>

          {/* Điều hướng Carousel (Nút trái/phải) */}
          {detail.display_image.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    prev > 0 ? prev - 1 : detail.display_image.length - 1,
                  )
                }
                className="bg-white/50 p-1 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    prev < detail.display_image.length - 1 ? prev + 1 : 0,
                  )
                }
                className="bg-white/50 p-1 rounded-full"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Badge đếm số ảnh */}
          <div className="absolute bottom-8 right-4 rounded-full bg-black/50 px-3 py-1">
            <span className="text-[10px] text-white font-medium">
              {t("masseurs_detail.display_image")} {currentIndex + 1}/
              {detail.display_image.length}
            </span>
          </div>

          {/* Nút Action Top */}
          <div className="absolute top-10 left-4 right-4 flex justify-between">
            <button
              onClick={() => router.back()}
              className="bg-white/80 p-2 rounded-full"
            >
              <ChevronLeft size={20} className="text-[#your-primary-color]" />
            </button>
            <button
              onClick={() => getRoomChat({ user_id: detail.id })}
              className="bg-white/80 p-2 rounded-full"
            >
              <MessageCircle size={20} className="text-[#your-primary-color]" />
            </button>
          </div>
        </div>

        {/* --- INFO SECTION --- */}
        <div className="relative -mt-6 rounded-t-[32px] bg-gray-50 rounded-b-lg px-4 pt-6 pb-6  z-10">
          <div className="flex flex-row items-center gap-4">
            <AvatarKTV source={detail.profile.avatar_url} />
            <div>
              <h1 className="font-bold text-2xl text-gray-800">
                {detail.name}
              </h1>
            </div>
          </div>

          {/* Rating & Job Count */}
          <div className="mt-4 flex flex-row items-center gap-3">
            <div className="flex flex-row items-center bg-orange-50 px-2 py-1 rounded">
              <Star size={14} fill="#F59E0B" className="text-yellow-500 mr-1" />
              <span className="font-bold text-xs text-orange-500">
                {detail.rating} ({detail.review_count}){" "}
                {t("masseurs_detail.review_count")}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {t("masseurs_detail.sales_count", {
                count: detail.jobs_received_count,
              })}
            </span>
          </div>

          {/* Giới thiệu */}
          <div className="mt-5">
            <h2 className="font-bold text-lg text-[#your-primary-color]">
              {t("masseurs_detail.introduction")}
            </h2>
            <div className="mt-2">
              <p
                className={`text-sm leading-relaxed text-gray-700 ${!isBioExpanded && "line-clamp-2"}`}
              >
                {detail.review_application.bio}
              </p>
              {detail.review_application.bio?.length > 100 && (
                <button
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                  className="mt-2 w-full bg-gray-50 py-2 rounded-lg text-xs text-gray-500 font-medium"
                >
                  {isBioExpanded ? t("common.hide") : t("common.see_more")}
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-4 border-t border-gray-100 pt-5 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-tight">
                {t("masseurs_detail.experience")}
              </span>
              <span className="font-semibold text-sm">
                {detail.review_application.experience} {t("common.year")}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-tight">
                {t("masseurs_detail.gender")}
              </span>
              <span className="font-semibold text-sm">
                {t(_GenderMap[detail.profile.gender])}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-tight">
                {t("masseurs_detail.age")}
              </span>
              <span className="font-semibold text-sm">
                {detail.profile.date_of_birth
                  ? dayjs().diff(dayjs(detail.profile.date_of_birth), "year")
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-tight">
                {t("masseurs_detail.price_transportation")}
              </span>
              <span className="font-semibold text-sm">
                {priceTransportation ? formatBalance(priceTransportation) : "-"}{" "}
                {t("common.currency")}
              </span>
            </div>
          </div>
        </div>

        {/* --- DANH SÁCH DỊCH VỤ --- */}
        <div className="mt-4 bg-gray-50 rounded-lg px-4 pt-5 pb-10">
          <h2 className="mb-5 border-l-4 border-[#your-primary-color] pl-2 font-bold text-lg text-gray-800">
            {t("masseurs_detail.service_list")}
          </h2>

          <div className="space-y-4">
            {detail && detail.service_categories.length > 0 ? (
              detail.service_categories.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="border-b border-gray-50 last:border-0 pb-2"
                >
                  <ServiceCard
                    item={item}
                    t={t}
                    setItem={handleOpenServiceSheet}
                  />
                </div>
              ))
            ) : (
              <Empty className="bg-gray-50" />
            )}
          </div>
        </div>
        {/* Lịch làm việc */}
        {detail.schedule && (
          <div className="mt-2 bg-gray-50 rounded-lg">
            <ScheduleSection
              schedule={detail.schedule}
              isOnlineRealtime={isOnlineRealtime}
            />
          </div>
        )}

        {/* --- Review Section --- */}
        <div className="mt-2 bg-gray-50 rounded-t-lg p-4">
          <h2 className="font-bold text-base text-gray-800 mb-3">
            {t("masseurs_detail.review_by_customer")}
          </h2>
          <div className="mb-4 rounded bg-orange-50 px-3 py-2">
            <p className="text-[10px] leading-4 text-orange-500">
              {t("masseurs_detail.review_disclaimer")}
            </p>
          </div>
          {detail.recent_reviews.length > 0 ? (
            detail.recent_reviews.map((item, index) => (
              <ReviewFistItem key={item.id ?? `review-${index}`} item={item} />
            ))
          ) : (
            <Empty />
          )}

          {detail.review_count > 1 && (
            <button
              onClick={() => setShowReviewList(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-50 py-2.5 rounded-full text-xs text-gray-500 font-medium"
            >
              {t("masseurs_detail.see_all_reviews", {
                count: detail.review_count - 1,
              })}
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <ReviewListModal
        isVisible={showReviewList}
        onClose={() => setShowReviewList(false)}
        params={{ user_id: detail.id }}
      />

      <ServicesModal
        isVisible={isServiceModalVisible}
        serviceData={serviceData}
        onDismiss={handleDismissServiceSheet}
        handlePrepareBooking={handlePrepareBooking}
        t={t}
      />
    </div>
  );
};

export default MasseurDetailScreen;
