import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  Loader2,
  Star,
  Globe,
  EyeOff,
  Languages,
  Settings,
} from "lucide-react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { ListReviewRequest, ReviewItem } from "@/features/service/types";
import { useGetReviewList } from "@/features/service/hooks";
import { useReviewTranslation } from "@/features/service/hooks/use-review-translation";
import SelectLanguageTranslate from "../select-language-tranlate";

interface ReviewListModalProps {
  isVisible: boolean;
  onClose: () => void;
  params: ListReviewRequest["filter"];
}

// ─── StarRating ───────────────────────────────────────────────────────────────
const StarRating = ({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) => (
  <div className="flex flex-row gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        fill={s <= rating ? "#FBBF24" : "none"}
        stroke={s <= rating ? "#FBBF24" : "#D1D5DB"}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

// ─── Review item ──────────────────────────────────────────────────────────────
const Review = React.memo(
  ({
    item,
    t,
    onPressTranslate,
    onPressChangeLang,
    onPressHideTranslation,
  }: {
    item: ReviewItem;
    t: (key: string) => string;
    onPressTranslate?: (item: ReviewItem) => void;
    onPressChangeLang?: (item: ReviewItem) => void;
    onPressHideTranslation?: (reviewId: string) => void;
  }) => {
    const [imageError, setImageError] = useState(false);

    const hasTranslation =
      !!item.comment?.trim() && !!(item.translated_comment ?? "").trim();

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3 flex flex-col gap-3">
        {/* Avatar + Meta */}
        <div className="flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 relative">
            {item.reviewer?.avatar && !item.hidden && !imageError ? (
              <Image
                src={item.reviewer.avatar}
                alt="Reviewer"
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50">
                <span className="text-blue-500 font-semibold text-sm">
                  {item.hidden ? "?" : (item.reviewer?.name?.charAt(0) ?? "?")}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1">
            <span className="font-semibold text-gray-800 text-sm">
              {item.hidden
                ? t("review.hidden_user")
                : (item.reviewer?.name ?? "—")}
            </span>
            <div className="flex flex-row items-center gap-2 mt-0.5">
              <StarRating rating={item.rating} />
              <span className="text-gray-400 text-xs">
                {dayjs(item.review_at).format("DD/MM/YYYY")}
              </span>
            </div>
          </div>
        </div>

        {/* Comment */}
        {item.comment?.trim() ? (
          <div className="flex flex-col gap-2">
            <span className="text-gray-700 text-sm leading-relaxed">
              {item.comment}
            </span>

            {/* Bản dịch — hiện khi item.translated_comment có giá trị */}
            {hasTranslation && (
              <div className="flex flex-col gap-1.5 pt-3 border-t border-dashed border-blue-100">
                <div className="flex flex-row items-center gap-1.5">
                  <Globe size={10} color="#60A5FA" />
                  <span className="text-[10px] text-blue-400 font-medium">
                    {t("review.translation")}
                  </span>
                </div>
                <span className="text-gray-600 text-sm leading-relaxed">
                  {item.translated_comment}
                </span>
              </div>
            )}

            {/* Action row */}
            <div className="flex flex-row items-center gap-2 mt-1">
              {/* Ẩn bản dịch — chỉ hiện khi đã có bản dịch */}
              {hasTranslation && (
                <button
                  onClick={() => onPressHideTranslation?.(item.id)}
                  className="flex flex-row items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                  style={{
                    background: "#EFF6FF",
                    color: "#3B82F6",
                    borderColor: "#BFDBFE",
                  }}
                >
                  <EyeOff size={12} />
                  <span>{t("review.hide_translation")}</span>
                </button>
              )}

              {/* Nút dịch */}
              <button
                onClick={() => onPressTranslate?.(item)}
                className="flex flex-row items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                style={{
                  background: "#F9FAFB",
                  color: "#6B7280",
                  borderColor: "#E5E7EB",
                }}
              >
                {(item as any).isTranslating ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Languages size={12} />
                )}
                <span>{t("review.translate")}</span>
              </button>
              {/* Nút đổi ngôn ngữ */}

              {hasTranslation && (
                <button
                  onClick={() => onPressChangeLang?.(item)}
                  className="flex flex-row items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                  style={{
                    background: "#F9FAFB",
                    color: "#6B7280",
                    borderColor: "#E5E7EB",
                  }}
                >
                  <Settings size={12} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <span className="text-gray-400 italic text-sm">
            {t("review.no_comment")}
          </span>
        )}
      </div>
    );
  },
);
Review.displayName = "Review";
Review.displayName = "Review";

// ─── Modal ────────────────────────────────────────────────────────────────────
const ReviewListModal = ({
  isVisible,
  onClose,
  params,
}: ReviewListModalProps) => {
  const { t } = useTranslation();

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
    params: currentParams,
  } = useGetReviewList(isVisible);

  const {
    targetLang,
    modalLangVisible,
    handleTranslateReview,
    handleChangeLanguageForReview,
    handleChangeTargetLang,
    handleCloseModalLang,
    handleHideTranslation,
  } = useReviewTranslation(currentParams);

  useEffect(() => {
    if (isVisible) {
      setFilter(params);
      refetch();
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Modal container */}
      <div className="bg-gray-50 w-full max-w-2xl h-[90vh] sm:h-[80vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading || isRefetching ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500 mt-2">
                {t("common.loading")}
              </p>
            </div>
          ) : data && data.length > 0 ? (
            <div className="flex flex-col">
              {data.map((item: ReviewItem) => (
                <Review
                  key={item.id}
                  item={item}
                  t={t}
                  onPressTranslate={handleTranslateReview}
                  onPressChangeLang={handleChangeLanguageForReview}
                  onPressHideTranslation={handleHideTranslation}
                />
              ))}

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
        </div>
      </div>

      {/* Modal chọn ngôn ngữ */}
      <SelectLanguageTranslate
        visible={modalLangVisible}
        onClose={handleCloseModalLang}
        selectedLang={targetLang}
        setLanguage={handleChangeTargetLang}
      />

      {/* Click outside */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default ReviewListModal;
