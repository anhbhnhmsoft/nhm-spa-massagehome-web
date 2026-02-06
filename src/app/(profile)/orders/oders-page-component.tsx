"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

import { _BookingStatus, _BookingStatusMap } from "@/features/service/const";
import { useGetBookingList } from "@/features/booking/hooks";
import { cn } from "@/lib/utils";
import { BookingCard, CancellationModal } from "@/components/app/booking";
import Empty from "@/components/emty";
import GradientBackground from "@/components/styles/gradient-background";
import { useOrdersStore } from "@/features/booking/store";

export default function OrdersPageComponent() {
  const { t } = useTranslation();
  const status = useOrdersStore((state) => state.status);
  const router = useRouter();

  // Ref cho tính năng kéo chuột
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
    showModalCancelBooking,
    setShowModalCancelBooking,
    handleOpenModalCancelBooking,
    handleCancelBooking,
    isCancelBookingPending,
  } = useGetBookingList();

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="w-full bg-white min-h-screen shadow-sm flex flex-col">
        {/* --- HEADER --- */}
        <GradientBackground className="relative w-full overflow-hidden bg-gradient-to-br pt-8 pb-6">
          <div className="flex items-center justify-between mb-6 px-4 md:px-8">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">
                {t("header_app.title_orders")}
              </h1>
              <p className="text-xs md:text-sm text-blue-100 opacity-90 font-medium">
                {t("header_app.orders_description")}
              </p>
            </div>

            <button
              onClick={() => router.back()}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="w-full overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex gap-2 pb-2 min-w-max px-4 md:px-8">
              {Object.entries(_BookingStatusMap).map(([key, value]) => {
                const statusKey = Number(key);
                const isChecked = params?.filter?.status === statusKey;

                return (
                  <button
                    key={key}
                    onClick={() => setFilter({ status: statusKey })}
                    className={cn(
                      "whitespace-nowrap rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 border flex-shrink-0",
                      isChecked
                        ? "bg-white text-blue-700 border-white shadow-md"
                        : "bg-blue-800/30 text-blue-100 border-blue-400/20 hover:bg-blue-800/40",
                    )}
                  >
                    {t(value)}
                  </button>
                );
              })}
            </div>
          </div>
        </GradientBackground>

        {/* --- BODY / LIST --- */}
        <main className="flex-1 px-4 py-6 md:px-8">
          {isRefetching && !data?.length ? (
            <div className="flex justify-center py-10 italic text-slate-400">
              {t("common.loading")}...
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {data.map((item, index) => (
                <BookingCard
                  key={`${item.id}-${index}`}
                  item={item}
                  onRefresh={() => refetch()}
                  cancelBooking={handleOpenModalCancelBooking}
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
