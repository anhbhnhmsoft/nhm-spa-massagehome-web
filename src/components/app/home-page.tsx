"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useListBannerQuery } from "@/features/commercial/hooks/use-query";
import { Skeleton } from "../skeleton";

const HEIGHT = 617;

export function CarouselBanner({
  bannerQuery,
}: {
  bannerQuery: ReturnType<typeof useListBannerQuery>;
}) {
  const { data: banners, isLoading, isFetching } = bannerQuery;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000 }),
  ]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {
      setIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  // Loading Skeleton cũng phải giữ đúng tỷ lệ
  if (isLoading || isFetching || !banners || banners.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1024px]">
        <Skeleton className="w-full aspect-[1024/617] rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1024px] relative">
      <div
        ref={emblaRef}
        // Sử dụng aspect-ratio để chiều cao tự động tính theo chiều rộng
        className="overflow-hidden rounded-2xl aspect-[1024/617] w-full"
      >
        <div className="flex h-full">
          {banners.map((item, i) => (
            <div key={item.id} className="relative flex-[0_0_100%] h-full">
              <Image
                src={item.image_url}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              i === index ? "bg-white w-5" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
export function InviteSection() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
      {/* Button 1 */}
      <button className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3 transition-hover hover:bg-slate-100 text-left">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-sm">
          <Image
            src="/images/image_ktv.png"
            alt="KTV"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 md:text-base">
            Mời Kỹ thuật viên
          </h3>
          <p className="text-xs text-slate-500">
            Đặt lịch ngay với KTV yêu thích
          </p>
        </div>
      </button>

      {/* Button 2 */}
      <button className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3 transition-hover hover:bg-slate-100 text-left">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-sm">
          <Image
            src="/images/image_agency.png"
            alt="Agency"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 md:text-base">
            Đối tác Agency
          </h3>
          <p className="text-xs text-slate-500">
            Giải pháp dành cho doanh nghiệp
          </p>
        </div>
      </button>
    </div>
  );
}

export function KTVSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">
          Kỹ thuật viên gợi ý
        </h2>
        <button className="text-xs font-bold text-blue-600 hover:underline">
          Xem tất cả
        </button>
      </div>

      {/* Grid Responsive: Mobile 3 cột, Tablet 4, Desktop 6 */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="group cursor-pointer space-y-2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-200">
              <div className="absolute inset-0 bg-slate-300 animate-pulse" />
              {/* Image sẽ nằm ở đây */}
            </div>
            <div className="space-y-1">
              <div className="h-3 w-3/4 rounded bg-slate-200" />
              <div className="h-2 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dữ liệu giả lập (Bạn sẽ thay bằng dữ liệu từ API sau)
const CATEGORIES = [
  {
    id: 1,
    title: "Massage Body",
    description: "Thư giãn toàn thân với tinh dầu",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200",
    count: "12 KTV",
  },
  {
    id: 2,
    title: "Massage Chân",
    description: "Giảm mệt mỏi sau ngày dài",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=200",
    count: "8 KTV",
  },
  {
    id: 3,
    title: "Trị liệu cổ vai gáy",
    description: "Dành cho dân văn phòng",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=200",
    count: "15 KTV",
  },
];

export function CategorySection() {
  const { t } = useTranslation();

  return (
    <div className="mb-10 mt-8">
      {/* Header Section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 md:text-xl">
          {t("homepage.services") || "Dịch vụ"}
        </h2>
        <Link
          href="/services"
          className="text-xs font-bold text-blue-600 transition-colors hover:text-blue-700 md:text-sm"
        >
          {t("common.see_all") || "Xem tất cả"}
        </Link>
      </div>

      {/* Grid: Mobile 1 cột (List), Tablet 2 cột, Desktop 3 cột */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((item) => (
          <Link
            key={item.id}
            href={`/services/${item.id}`}
            className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-blue-200 hover:shadow-md active:scale-[0.98]"
          >
            {/* Image Container */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 md:h-20 md:w-20">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <h3 className="truncate font-bold text-slate-800 group-hover:text-blue-600 md:text-base">
                {item.title}
              </h3>
              <p className="truncate text-xs text-slate-500 md:text-sm">
                {item.description}
              </p>
              <span className="mt-1 inline-block text-[10px] font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                {item.count}
              </span>
            </div>

            {/* Arrow Icon */}
            <ChevronRight
              size={18}
              className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-400"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
