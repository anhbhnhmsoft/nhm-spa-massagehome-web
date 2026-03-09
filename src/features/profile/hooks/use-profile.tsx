import useAuthStore from "@/features/auth/store/auth-store";
import { useQueryDashboardProfile } from "@/features/profile/hooks/use-query";
import useApplicationStore from "@/lib/store";
import { useCallback, useEffect, useMemo } from "react";

/**
 * Xử lý màn hình profile
 */
export const useProfileCustomer = () => {
  const user = useAuthStore((state) => state.user);
  const setLoading = useApplicationStore((s) => s.setLoading);

  const {
    data: DashboardData,
    isLoading: DashboardLoading,
    isRefetching: DashboardLoadingRefetch,
    refetch: DashboardRefetch,
  } = useQueryDashboardProfile();

  const isLoading = useMemo(() => {
    return DashboardLoading || DashboardLoadingRefetch;
  }, [DashboardLoading, DashboardLoadingRefetch]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const refreshProfile = useCallback(async () => {
    await DashboardRefetch();
  }, [DashboardRefetch]);

  return {
    user,
    dashboardData: DashboardData,
    refreshProfile,
    isLoading,
  };
};
