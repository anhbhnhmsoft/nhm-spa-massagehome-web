"use client";

import useToast from "@/features/app/hooks/use-toast";
import {
  useInfiniteCategoryList,
  useInfiniteListReview,
  useInfiniteServiceList,
  useQueryListCouponUser,
} from "@/features/service/hooks/use-query";
import {
  CategoryListFilterPatch,
  CategoryListRequest,
  CouponUserListRequest,
  ListReviewRequest,
  PickBookingItem,
  SendReviewRequest,
  ServiceItem,
  ServiceListRequest,
} from "@/features/service/types";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useImmer } from "use-immer";
import {
  useMutationPrepareBooking,
  useMutationSendReview,
  useMutationServiceDetail,
} from "./use-mutation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { getMessageError } from "@/lib/utils";
import useServiceStore from "../stores";
import { useCheckAuthToRedirect } from "@/features/auth/hooks";
import useApplicationStore from "@/lib/store";
import useErrorToast from "@/features/app/hooks/use-error-toast";
import { useRouter } from "next/navigation";
/**
 * Lấy danh sách danh mục dịch vụ
 * @param initialParams
 * @param isFeature
 */
export const useGetCategoryList = (
  initialParams: Omit<CategoryListRequest, "filter">,
  isFeature?: boolean,
) => {
  // Sử dụng useImmer để quản lý params (chứa filter)
  const [params, setParams] = useImmer<CategoryListRequest>({
    ...initialParams,
    filter: {
      keyword: "",
      is_featured: isFeature === true ? true : undefined,
    },
  });
  // Hàm setFilter
  const setFilter = useCallback(
    (filterPatch: CategoryListFilterPatch) => {
      setParams((draft) => {
        // 🚨 QUAN TRỌNG: Reset page về 1 khi filter thay đổi
        draft.page = 1;
        // Merge filter mới vào draft.filter (sử dụng logic Immer)
        draft.filter = {
          ...draft.filter,
          ...filterPatch,
        };
      });
    },
    [setParams],
  );

  const query = useInfiniteCategoryList(params);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    data,
    pagination,
    params, // Trả về params hiện tại để dễ debug/hiển thị
    setFilter, // Trả về hàm setFilter để component sử dụng
  };
};

/**
 * Lấy danh sách dịch vụ
 * @param params
 * @param enabled
 */
export const useGetServiceList = (
  params: ServiceListRequest,
  enabled?: boolean,
) => {
  const query = useInfiniteServiceList(params, enabled);

  const setLoading = useApplicationStore((s) => s.setLoading);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading]);

  return {
    ...query,
    data,
    pagination,
  };
};

/**
 * Lưu thông tin dịch vụ vào store và chuyển hướng đến màn hình chi tiết dịch vụ
 */
export const useSetService = () => {
  const setService = useServiceStore((s) => s.setService);
  const redirect = useCheckAuthToRedirect();
  const router = useRouter();
  const { mutate } = useMutationServiceDetail();

  const setLoading = useApplicationStore((s) => s.setLoading);

  const handleError = useErrorToast();

  return (id: string) => {
    redirect(() => {
      setLoading(true);
      mutate(id, {
        onSuccess: (res) => {
          setService(res.data);
          router.push("/service-detail");
        },
        onError: (error) => {
          handleError(error);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    });
  };
};

/**
 * detail service
 */
export const useServiceDetail = () => {
  const service = useServiceStore((s) => s.service);
  const setPickServiceBooking = useServiceStore((s) => s.setPickServiceBooking);
  const router = useRouter();
  const handleError = useErrorToast();

  const { mutate } = useMutationPrepareBooking();
  // Kiểm tra xem dịch vụ có tồn tại và đang hoạt động hay không
  useEffect(() => {
    // Nếu không có service, quay lại màn hình trước
    if (!service || !service.is_active) {
      router.back();
    }
  }, [service]);

  const pickServiceToBooking = (data: PickBookingItem) => {
    mutate(data, {
      onSuccess: (res) => {
        setPickServiceBooking(res.data);
        router.push("/service-booking");
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return {
    detail: service as ServiceItem,
    pickServiceToBooking,
  };
};

/**
 * Lấy danh sách coupon đã sử dụng của user
 * @param params
 * @param enabled
 */
export const useGetCouponUserList = (
  params: CouponUserListRequest,
  enabled?: boolean,
) => {
  const query = useQueryListCouponUser(params, enabled);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    data,
    pagination,
  };
};

/**
 * hook dùng cho modal đánh giá dịch vụ
 * @param serviceBookingId ID của dịch vụ cần đánh giá
 * @param onSuccess Callback khi đánh giá thành công
 */
export const useReviewModal = (
  serviceBookingId: string | undefined,
  onSuccess: () => void,
) => {
  const { t } = useTranslation();
  const { success } = useToast();

  const { mutate: sendReview, isPending } = useMutationSendReview();

  const form = useForm<SendReviewRequest>({
    resolver: zodResolver(
      z.object({
        service_booking_id: z.string(),
        rating: z
          .number()
          .min(1, { error: t("services.error.rating_invalid") })
          .max(5, { error: t("services.error.rating_invalid") }),
        comment: z.string().max(1000).optional().or(z.literal("")),
        hidden: z.boolean().default(false),
      }),
    ),
    defaultValues: {
      service_booking_id: serviceBookingId || "",
      rating: 5,
      comment: "",
      hidden: false,
    },
  });

  useEffect(() => {
    if (serviceBookingId) {
      form.setValue("service_booking_id", serviceBookingId);
    }
  }, [serviceBookingId]);

  const onSubmit = (data: SendReviewRequest) => {
    sendReview(data, {
      onSuccess: () => {
        success({ message: t("services.success.review_success") });
        onSuccess();
        form.reset();
      },
      onError: (error) => {
        const message = getMessageError(error, t);
        if (message) {
          form.setError("comment", { message: message });
        }
      },
    });
  };

  return {
    form,
    loading: isPending,
    onSubmit,
  };
};

/**
 * Lấy danh sách review của user
 */
export const useGetReviewList = (enabled?: boolean) => {
  const [params, setParams] = useImmer<ListReviewRequest>({
    filter: {},
    page: 1,
    per_page: 10,
  });
  // Hàm setFilter
  const setFilter = useCallback(
    (filterPatch: Partial<ListReviewRequest["filter"]>) => {
      setParams((draft) => {
        // 🚨 QUAN TRỌNG: Reset page về 1 khi filter thay đổi
        draft.page = 1;
        // Merge filter mới vào draft.filter (sử dụng logic Immer)
        draft.filter = {
          ...draft.filter,
          ...filterPatch,
        };
      });
    },
    [setParams],
  );

  const query = useInfiniteListReview(params, enabled);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    params,
    setFilter,
    data,
    pagination,
  };
};
