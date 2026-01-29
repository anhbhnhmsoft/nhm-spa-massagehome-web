import {
  useInfiniteListKTV,
  useInfiniteListManageKTV,
  useQueryDashboardProfile,
} from "@/features/user/hooks/use-query";
import { useCallback, useEffect, useMemo } from "react";
import useUserServiceStore, { useKTVSearchStore } from "@/features/user/stores";
import useApplicationStore from "@/lib/store";
import { useMutationKtvDetail } from "./use-mutation";
import { useCheckAuth, useCheckAuthToRedirect } from "@/features/auth/hooks";
import useAuthStore from "@/features/auth/store";
import { useProfileQuery } from "@/features/auth/hooks/use-query";
import { useRouter } from "next/navigation";
import useErrorToast from "@/features/app/hooks/use-error-toast";
import { useGetServiceList } from "@/features/service/hooks";
import { KTVDetail } from "../types";

/**
 * Dùng để lấy list KTV theo filter
 */
export const useGetListKTV = () => {
  const params = useKTVSearchStore((state) => state.params);
  const setFilter = useKTVSearchStore((state) => state.setFilter);

  const query = useInfiniteListKTV(params);

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
    setFilter,
    params,
  };
};

/**
 * Dùng để get list KTV trong màn homepage customer
 * Sắp xếp theo đánh giá trung bình giảm dần
 */
export const useGetListKTVHomepage = () => {
  const query = useInfiniteListKTV({
    filter: {},
    // Sắp xếp theo đánh giá trung bình giảm dần
    sort_by: "reviews_received_avg_rating",
    direction: "asc",
    page: 1,
    per_page: 6,
  });
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

export const useGetListKTVManager = () => {
  const query = useInfiniteListManageKTV({
    filter: {},
    page: 1,
    per_page: 10,
  });

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
 * Lưu thông tin massager vào store và chuyển hướng đến màn hình chi tiết massager
 */
export const useSetKtv = () => {
  const setKtv = useUserServiceStore((s) => s.setKtv);
  const router = useRouter();
  const redirect = useCheckAuthToRedirect();

  const setLoading = useApplicationStore((s) => s.setLoading);

  const { mutate } = useMutationKtvDetail();

  return (id: string) => {
    redirect(() => {
      setLoading(true);
      mutate(id, {
        onSuccess: (res) => {
          setKtv(res.data);
          router.push("/masseurs-details");
        },
        onError: (error) => {},
        onSettled: () => {
          setLoading(false);
        },
      });
    });
  };
};

/**
 * Lấy thông tin ktv và danh sách dịch vụ của ktv đó
 */
export const useKTVDetail = () => {
  const ktv = useUserServiceStore((s) => s.ktv);
  const setKtv = useUserServiceStore((s) => s.setKtv);
  const { mutate } = useMutationKtvDetail();
  const handleError = useErrorToast();
  const router = useRouter();
  const setLoading = useApplicationStore((s) => s.setLoading);

  useEffect(() => {
    // Nếu không có massager, quay lại màn hình trước
    if (!ktv) {
      router.back();
    }
  }, [ktv]);

  const serviceParams = useMemo(
    () => ({
      filter: {
        user_id: ktv?.id,
      },
      page: 1,
      per_page: 5,
    }),
    [ktv?.id],
  );

  const queryServices = useGetServiceList(serviceParams, !!ktv);
  const refreshPage = useCallback(() => {
    if (ktv) {
      setLoading(true);
      mutate(ktv.id, {
        onSuccess: (res) => {
          setKtv(res.data);
          queryServices.refetch();
        },
        onError: (error) => {
          handleError(error);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    }
  }, [handleError, ktv, mutate, queryServices, setKtv, setLoading]);

  return {
    detail: ktv as KTVDetail,
    queryServices,
    refreshPage,
  };
};

/**
 * Xử lý màn hình profile
 */
export const useProfile = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useApplicationStore((s) => s.setLoading);
  const checkAuth = useCheckAuth();

  const queryProfile = useProfileQuery();
  const queryDashboard = useQueryDashboardProfile();

  // Cập nhật thông tin user khi có dữ liệu từ query
  useEffect(() => {
    if (queryProfile.data) {
      setUser(queryProfile.data);
    }
  }, [queryProfile.data]);

  // Chuyển hướng đến màn hình đăng nhập nếu chưa đăng nhập
  useEffect(() => {
    if (!checkAuth && !user) {
      router.push("/(auth)");
    }
  }, [checkAuth]);

  const isLoading = useMemo(() => {
    return (
      queryProfile.isLoading ||
      queryDashboard.isLoading ||
      queryDashboard.isRefetching ||
      queryProfile.isRefetching
    );
  }, [
    queryProfile.isLoading,
    queryDashboard.isLoading,
    queryDashboard.isRefetching,
    queryProfile.isRefetching,
  ]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const refreshProfile = useCallback(() => {
    queryProfile.refetch();
    queryDashboard.refetch();
  }, [queryProfile, queryDashboard]);

  return {
    user,
    dashboardData: queryDashboard.data,
    refreshProfile,
    isLoading,
  };
};
