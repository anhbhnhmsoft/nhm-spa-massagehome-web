"use client";

import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { _BookingStatus, _BookingStatusMap } from "@/features/service/const";
import { useGetBookingList } from "@/features/booking/hooks";
import { cn } from "@/lib/utils";
import {
  BookingCard,
  BookingDetailModal,
  CancellationModal,
} from "@/components/app/booking";
import Empty from "@/components/emty";
import { useOrdersStore } from "@/features/booking/store";
import Header from "@/components/header-app";
import { useGetRoomChat } from "@/features/chat/hooks";
import { ReviewModal } from "@/components/app/review-modal";

export default function OrdersPageComponent() {
  const { t } = useTranslation();
  const status = useOrdersStore((state) => state.status);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    setFilter,
    params,

    detail,
    openDetail,
    closeDetail,
    showDetailModal,

    showReviewModal,
    setShowReviewModal,
    handleOpenReview,

    showModalCancelBooking,
    setShowModalCancelBooking,
    handleOpenModalCancelBooking,
    handleCancelBooking,
    isCancelBookingPending,
  } = useGetBookingList();

  const getRoomChat = useGetRoomChat();

  useEffect(() => {
    if (status) {
      const statusEnum = Number(status) as _BookingStatus;
      setFilter({ status: statusEnum });
    }
  }, [status, setFilter]);

  // Logic kéo chuột để scroll (Drag to Scroll)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    scrollRef.current.classList.add("active");
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Tốc độ scroll
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Infinite Scroll logic
  const observerTarget = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen  flex flex-col items-center">
      <div className="w-full  min-h-screen flex flex-col">
        <Header showSearch={false} />
        {/* --- HEADER --- */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="w-full overflow-x-auto no-scrollbar py-4 cursor-grab active:cursor-grabbing"
          >
            <div className="flex gap-3 px-4 md:px-8 min-w-max">
              {Object.entries(_BookingStatusMap).map(([key, value]) => {
                const statusKey = Number(key);
                const isChecked = params?.filter?.status === statusKey;
                // Nếu không có status nào trong filter, mặc định nút "Tất cả" (giả sử key là 0 hoặc undefined) sẽ sáng
                const isActive =
                  isChecked || (statusKey === 0 && !params?.filter?.status);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter({ status: statusKey })}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                      "border shadow-sm active:scale-95",
                      isActive
                        ? "bg-primary-color-2 text-white font-bold  shadow-blue-100"
                        : "bg-blue-100 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-500",
                    )}
                  >
                    {t(value)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- BODY / LIST --- */}
        <main className="flex-1 px-4 py-6 md:px-8">
          {isRefetching && !data?.length ? (
            <div className="flex justify-center py-10 italic text-slate-400">
              {t("common.loading")}...
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {data.map((item) => (
                <BookingCard
                  item={item}
                  key={item.id}
                  openDetail={openDetail}
                  handleOpenCancelBooking={handleOpenModalCancelBooking}
                  getRoomChat={getRoomChat}
                  handleOpenReview={handleOpenReview}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 flex justify-center">
              <Empty />
            </div>
          )}

          <div
            ref={observerTarget}
            className="h-10 w-full flex justify-center items-center"
          >
            {isFetchingNextPage && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            )}
          </div>
        </main>
      </div>

      <BookingDetailModal
        isOpen={showDetailModal}
        onClose={closeDetail}
        item={detail}
      />
      {/* Review Modal */}
      <ReviewModal
        isVisible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        serviceBookingId={detail?.id}
        onSuccess={() => {
          setShowReviewModal(false);
          refetch();
        }}
      />

      <CancellationModal
        isVisible={showModalCancelBooking}
        onClose={() => setShowModalCancelBooking(false)}
        onConfirm={handleCancelBooking}
        isLoading={isCancelBookingPending}
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
