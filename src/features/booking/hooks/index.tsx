import { useInfiniteBookingList } from "@/features/booking/hooks/use-query";
import { useCallback, useMemo, useState } from "react";
import { ListBookingRequest, BookingItem } from "@/features/booking/types";
import { useImmer } from "use-immer";
import { _BookingStatus } from "@/features/service/const";
import { useCancelBookingCustomerMutation } from "@/features/booking/hooks/use-mutation";
import { useTranslation } from "react-i18next";
import useToast from "@/features/app/hooks/use-toast";
import { getMessageError } from "@/lib/utils";

export * from "./use-check-booking";
export * from "./use-booking";

export const useGetBookingList = () => {
  const { t } = useTranslation();

  const [params, setParams] = useImmer<ListBookingRequest>({
    filter: {
      status: _BookingStatus.ALL,
    },
    page: 1,
    per_page: 10,
  });

  const setFilter = useCallback(
    (filterPatch: Partial<ListBookingRequest["filter"]>) => {
      setParams((draft) => {
        draft.page = 1;
        draft.filter = {
          ...draft.filter,
          ...filterPatch,
        };
      });
    },
    [setParams],
  );

  const query = useInfiniteBookingList(params);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  // =========================
  // DETAIL MODAL
  // =========================

  const [detail, setDetail] = useState<BookingItem | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);

  const openDetail = useCallback((item: BookingItem) => {
    setDetail(item);
    setShowDetailModal(true);
  }, []);

  const closeDetail = useCallback(() => {
    setDetail(null);
    setShowDetailModal(false);
  }, []);

  // =========================
  // REVIEW MODAL
  // =========================

  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleOpenReview = useCallback((item: BookingItem) => {
    setDetail(item);
    setShowReviewModal(true);
  }, []);

  const [showModalCancelBooking, setShowModalCancelBooking] = useState(false);
  const [bookingIdCancel, setBookingIdCancel] = useState<string>("");

  const { error } = useToast();

  const { mutate: cancelBooking, isPending: isCancelBookingPending } =
    useCancelBookingCustomerMutation();

  const handleOpenModalCancelBooking = useCallback((bookingId: string) => {
    setBookingIdCancel(bookingId);
    setShowModalCancelBooking(true);
  }, []);

  const handleCancelBooking = useCallback(
    async (reason: string) => {
      if (reason.trim().length === 0) {
        alert(t("booking.booking_cancel_reason_required"));
        return;
      }

      const confirmed = window.confirm(
        `${t("booking.booking_cancel_confirm_title")}\n\n${t(
          "booking.booking_cancel_confirm_message",
        )}`,
      );

      if (!confirmed) return;

      cancelBooking(
        { booking_id: bookingIdCancel, reason },
        {
          onSuccess: async () => {
            await query.refetch();
            setShowModalCancelBooking(false);
          },
          onError: (err) => {
            const message = getMessageError(err, t);
            if (message) error({ message });
          },
        },
      );
    },
    [bookingIdCancel, cancelBooking, error, query, t],
  );

  return {
    ...query,
    data,
    pagination,
    params,
    setFilter,

    // detail
    detail,
    openDetail,
    closeDetail,
    showDetailModal,
    setShowDetailModal,

    // review
    showReviewModal,
    setShowReviewModal,
    handleOpenReview,

    // cancel
    showModalCancelBooking,
    setShowModalCancelBooking,
    handleOpenModalCancelBooking,
    handleCancelBooking,
    isCancelBookingPending,
  };
};
