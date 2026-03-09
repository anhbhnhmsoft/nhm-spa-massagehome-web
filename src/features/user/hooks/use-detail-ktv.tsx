import { useMutationKtvDetail } from "@/features/user/hooks/use-mutation";
import useErrorToast from "@/features/app/hooks/use-error-toast";
import { useCallback, useEffect, useState } from "react";
import { KTVDetail, ServiceCategoryItem } from "@/features/user/types";
import useUserServiceStore from "../stores";
import { usePrepareBookingStore } from "@/features/profile/stores";
import { useRouter } from "next/navigation";

/**
 * Xử lý man chi tiết KTV
 */
export const useDetailKtv = () => {
  const ktv = useUserServiceStore((s) => s.ktv);

  const setKtv = useUserServiceStore((s) => s.setKtv);

  const setItem = usePrepareBookingStore((s) => s.setItem);

  const [serviceData, setServiceData] = useState<ServiceCategoryItem | null>(
    null,
  );

  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);

  const { mutate } = useMutationKtvDetail();

  const handleError = useErrorToast();

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Nếu không có massager, quay lại màn hình trước
    if (!ktv) {
      router.back();
    }
  }, [ktv]);

  // Lấy lại thông tin của KTV
  const refreshPage = useCallback(() => {
    if (ktv) {
      setLoading(true);
      mutate(ktv.id, {
        onSuccess: (res) => {
          setKtv(res.data);
        },
        onError: (error) => {
          handleError(error);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    }
  }, [handleError, ktv, mutate, setKtv]);

  // Mở modal để chọn dịch vụ
  const handleOpenServiceSheet = useCallback((item: ServiceCategoryItem) => {
    setServiceData(item);
    setIsServiceModalVisible(true);
  }, []);

  // Đóng modal khi chọn dịch vụ
  const handleDismissServiceSheet = useCallback(() => {
    setServiceData(null);
    setIsServiceModalVisible(false);
  }, []);

  // Xử lý chọn dịch vụ
  const handlePrepareBooking = useCallback(
    (option: { id: string; price: string; duration: number }) => {
      handleDismissServiceSheet();

      if (serviceData && ktv) {
        setItem({
          service: {
            category_id: serviceData.id,
            price_id: option.id,
            name: serviceData.name,
            image_url: serviceData.image_url,
            temp_price: option.price,
            duration: option.duration,
          },
          ktv: {
            id: ktv.id,
            name: ktv.name,
            image_url: ktv.profile.avatar_url,
            rating: ktv.rating,
          },
        });
        router.push("/service-booking");
      }
    },
    [handleDismissServiceSheet, serviceData, ktv, setItem, router],
  );

  return {
    detail: ktv as KTVDetail,
    loading,
    refreshPage,
    isServiceModalVisible,
    serviceData,
    handleOpenServiceSheet,
    handleDismissServiceSheet,
    handlePrepareBooking,
  };
};
