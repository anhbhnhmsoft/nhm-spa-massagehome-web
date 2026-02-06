import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react"; // Dùng lucide-react cho Web
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

// Giữ nguyên logic hooks và types của bạn
import { ListReviewRequest, ReviewItem } from "@/features/service/types";
import StarRating from "@/components/star-rating";
import { useGetReviewList } from "@/features/service/hooks";

interface ReviewListModalProps {
  isVisible: boolean;
  onClose: () => void;
  params: ListReviewRequest["filter"];
}

// Component Review Item đơn lẻ
const Review = React.memo(({ item, t }: { item: ReviewItem; t: any }) => {
  const [imageError, setImageError] = useState<boolean>(false);

  return (
    <div className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-100 flex flex-col">
      <div className="flex flex-row items-center mb-3">
        {/* Avatar xử lý */}
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 relative">
          {item.reviewer?.avatar && !item.hidden && !imageError ? (
            <Image
              src={item.reviewer.avatar}
              alt="Reviewer"
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100">
              <span className="text-blue-600 font-bold text-sm">
                {item.hidden ? "?" : item.reviewer?.name?.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="ml-3 flex-1">
          <p className="font-bold text-gray-800 text-sm">
            {item.hidden ? t("review.hidden_user") : item.reviewer?.name}
          </p>
          <div className="flex flex-row items-center mt-0.5 gap-2">
            <StarRating rating={item.rating} size={16} />
            <span className="text-gray-400 text-xs">
              {dayjs(item.review_at).format("DD/MM/YYYY")}
            </span>
          </div>
        </div>
      </div>

      {item.comment ? (
        <p className="text-gray-600 text-sm leading-relaxed">{item.comment}</p>
      ) : (
        <p className="text-gray-400 italic text-sm">{t("review.no_comment")}</p>
      )}
    </div>
  );
});

Review.displayName = "Review";

const ReviewListModal = ({
  isVisible,
  onClose,
  params,
}: ReviewListModalProps) => {
  const { t } = useTranslation();

  // Giả định hook này trả về các hàm điều khiển dữ liệu
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
    pagination,
    setFilter,
  } = useGetReviewList(isVisible);

  useEffect(() => {
    if (isVisible) {
      setFilter(params);
      refetch();
      // Ngăn scroll body khi mở modal
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible, params, setFilter, refetch]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      {/* Container Modal */}
      <div className="bg-gray-50 w-full max-w-2xl h-[90vh] sm:h-[80vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-transform translate-y-0">
        {/* --- Header --- */}
        <div className="flex flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-none">
              {t("review.all_reviews")}
            </h2>
            {(pagination?.meta?.total || 0) > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {t("review.total_reviews", {
                  count: pagination?.meta?.total || 0,
                })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* --- Body (Thay thế cho FlatList) --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {isLoading || isRefetching ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500 mt-2">
                {t("common.loading")}
              </p>
            </div>
          ) : (
            <>
              {data && data.length > 0 ? (
                <div className="flex flex-col">
                  {data.map((item: ReviewItem) => (
                    <Review key={item.id} item={item} t={t} />
                  ))}

                  {/* Phân trang (Nút bấm hoặc Trigger để load thêm) */}
                  {hasNextPage && (
                    <button
                      disabled={isFetchingNextPage}
                      onClick={() => fetchNextPage()}
                      className="py-4 flex justify-center items-center text-blue-500 text-sm font-medium"
                    >
                      {isFetchingNextPage ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        t("common.load_more")
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20">
                  <p className="text-gray-400">{t("review.no_reviews")}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default ReviewListModal;
