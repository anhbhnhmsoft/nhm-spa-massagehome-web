import { useState, useCallback } from "react";
import { _LanguageCode } from "@/lib/const";
import { useMutationTranslateReview } from "./use-mutation";
import {
  ListReviewRequest,
  ListReviewResponse,
  ReviewItem,
} from "@/features/service/types";
import { useImmer } from "use-immer";
import { queryClient } from "@/lib/provider/query-provider";
import { InfiniteData } from "@tanstack/query-core";
import { produce } from "immer";
import { _DEFAULT_TRANSLATIONS, LanguageTranslations } from "@/lib/types";

export function useReviewTranslation(params: ListReviewRequest) {
  const { mutate: translateMutate, isPending } = useMutationTranslateReview();

  const [reviewItemSelected, setReviewItemSelected] =
    useState<ReviewItem | null>(null);

  const [visibleSelectLang, setVisibleSelectLang] = useState(false);

  const [targetLang, setTargetLang] = useState<_LanguageCode | null>(null);

  const [translatedComment, setTranslatedComment] =
    useImmer<LanguageTranslations>(_DEFAULT_TRANSLATIONS);

  // ── Bật/tắt loading trên item trong cache ──────────────────────────────────
  const setItemTranslating = useCallback(
    (reviewId: string, loading: boolean) => {
      queryClient.setQueryData<InfiniteData<ListReviewResponse>>(
        ["serviceApi-listReview", params],
        (oldData) => {
          if (!oldData) return oldData;
          return produce(oldData, (draft) => {
            for (const page of draft.pages) {
              const review = page.data.data.find(
                (item: ReviewItem) => item.id === reviewId,
              );
              if (review) {
                (review as any).isTranslating = loading;
                break;
              }
            }
          });
        },
      );
    },
    [params],
  );

  // ── Ghi bản dịch vào cache + tắt loading ──────────────────────────────────
  const handleUpdateTranslation = useCallback(
    (reviewId: string, translated: string, lang: _LanguageCode) => {
      queryClient.setQueryData<InfiniteData<ListReviewResponse>>(
        ["serviceApi-listReview", params],
        (oldData) => {
          if (!oldData) return oldData;
          return produce(oldData, (draft) => {
            for (const page of draft.pages) {
              const review = page.data.data.find(
                (item: ReviewItem) => item.id === reviewId,
              );
              if (review) {
                review.translated_comment = translated;
                review.target_lang_translated = lang;
                (review as any).isTranslating = false;
                break;
              }
            }
          });
        },
      );
    },
    [params],
  );

  // ── Hàm dịch chính — nhận item + cache trực tiếp, không dùng state ────────
  const translate = useCallback(
    (lang: _LanguageCode, item: ReviewItem, cache: LanguageTranslations) => {
      if (!item.comment || item.comment.trim().length === 0) return;

      // Đã có trong cache → dùng luôn
      if (cache[lang] && cache[lang].length > 0) {
        handleUpdateTranslation(item.id, cache[lang], lang);
        return;
      }

      setItemTranslating(item.id, true);

      translateMutate(
        { review_id: item.id, lang },
        {
          onSuccess: ({ data }) => {
            const text = data.translate;
            setTranslatedComment((draft) => {
              draft[lang] = text;
            });
            handleUpdateTranslation(item.id, text, lang);
          },
          onError: () => {
            setItemTranslating(item.id, false);
          },
        },
      );
    },
    [
      translateMutate,
      handleUpdateTranslation,
      setItemTranslating,
      setTranslatedComment,
    ],
  );

  // ── Bấm "Dịch" trên item ───────────────────────────────────────────────────
  const handleTranslateReview = useCallback(
    (item: ReviewItem) => {
      let newCache = translatedComment;

      // Sync cache từ item
      if (item.comment_translated) {
        setTranslatedComment(item.comment_translated);
        newCache = item.comment_translated;
      } else if (item.target_lang_translated && item.translated_comment) {
        const lang = item.target_lang_translated;
        const text = item.translated_comment;
        setTranslatedComment((draft) => {
          draft[lang] = text;
        });
        newCache = { ...translatedComment, [lang]: text };
      } else {
        setTranslatedComment(_DEFAULT_TRANSLATIONS);
        newCache = _DEFAULT_TRANSLATIONS;
      }

      setReviewItemSelected(item);

      // Chưa có ngôn ngữ → mở modal chọn
      if (!targetLang) {
        setVisibleSelectLang(true);
        return;
      }

      // Đã có ngôn ngữ → dịch luôn
      translate(targetLang, item, newCache);
    },
    [targetLang, translate, translatedComment, setTranslatedComment],
  );

  // ── Chọn ngôn ngữ trong modal ──────────────────────────────────────────────
  const handleChangeTargetLang = useCallback(
    (lang: _LanguageCode) => {
      setTargetLang(lang);
      setVisibleSelectLang(false);

      if (reviewItemSelected) {
        translate(lang, reviewItemSelected, translatedComment);
      }
    },
    [translate, reviewItemSelected, translatedComment],
  );

  // ── Bấm Settings để đổi ngôn ngữ ──────────────────────────────────────────
  const handleChangeLanguageForReview = useCallback((item: ReviewItem) => {
    setReviewItemSelected(item);
    setVisibleSelectLang(true);
  }, []);

  // ── Ẩn bản dịch ───────────────────────────────────────────────────────────
  const handleHideTranslation = useCallback(
    (reviewId: string) => {
      queryClient.setQueryData<InfiniteData<ListReviewResponse>>(
        ["serviceApi-listReview", params],
        (oldData) => {
          if (!oldData) return oldData;
          return produce(oldData, (draft) => {
            for (const page of draft.pages) {
              const review = page.data.data.find(
                (item: ReviewItem) => item.id === reviewId,
              );
              if (review) {
                review.translated_comment = undefined;
                review.target_lang_translated = undefined;
                break;
              }
            }
          });
        },
      );
    },
    [params],
  );

  const handleCloseModalLang = useCallback(() => {
    setVisibleSelectLang(false);
  }, []);

  return {
    targetLang,
    modalLangVisible: visibleSelectLang,

    handleTranslateReview,
    handleChangeLanguageForReview,
    handleHideTranslation,
    handleChangeTargetLang,
    handleCloseModalLang,

    loading: isPending,
  };
}
