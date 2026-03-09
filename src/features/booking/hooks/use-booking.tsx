import { usePrepareBookingStore } from "@/features/profile/stores";
import { useCallback, useEffect, useState } from "react";
import { getMessageError } from "@/lib/utils";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  BookingServiceRequest,
  PrepareBookingResponse,
} from "@/features/booking/types";
import { useQueryListCoupon } from "@/features/service/hooks/use-query";
import {
  useMutationBookingService,
  useMutationPrepareBooking,
} from "@/features/booking/hooks/use-mutation";
import { useBookingStore } from "@/features/booking/stores";
import useApplicationStore from "@/lib/store";
import { useRouter } from "next/navigation";

/**
 * Hook dùng cho booking
 */
export const useBooking = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const item = usePrepareBookingStore((s) => s.item);

  const userLocation = useApplicationStore((s) => s.location);

  const setBookingId = useBookingStore((s) => s.setBookingId);

  const setLoading = useApplicationStore((s) => s.setLoading);

  const form = useForm<BookingServiceRequest>({
    resolver: zodResolver(
      z.object({
        ktv_id: z.string(),
        category_id: z.string(),
        option_id: z.string(),
        note: z.string().optional(),
        note_address: z.string().optional(),
        address: z.string().min(1, {
          error: t("services.error.invalid_address"),
        }),
        latitude: z.number(),
        longitude: z.number(),
        coupon_id: z.string().nullable().optional(),
      }),
    ),
    defaultValues: {
      category_id: "",
      option_id: "",
      note: "",
      note_address: "",
      address: "",
      latitude: 0,
      longitude: 0,
    },
  });

  // redirect nếu không có item
  useEffect(() => {
    if (!item) {
      router.back();
      return;
    }

    form.reset({
      category_id: item.service.category_id,
      option_id: item.service.price_id,
      ktv_id: item.ktv.id,
      note: "",
      note_address: "",
      address: "",
      latitude: 0,
      longitude: 0,
    });
  }, [item]);

  // auto fill location
  useEffect(() => {
    if (!userLocation) return;

    form.setValue("address", userLocation.address);
    form.setValue("latitude", userLocation.location?.coords.latitude ?? 0);
    form.setValue("longitude", userLocation.location?.coords.longitude ?? 0);
  }, [userLocation]);

  const queryCoupon = useQueryListCoupon({ filter: {} }, true);

  const { mutate: mutateBookingService, isPending: loadingBookingService } =
    useMutationBookingService();

  const [dataPricing, setDataPricing] = useState<
    PrepareBookingResponse["data"] | null
  >(null);

  const [error, setError] = useState<string | null>(null);

  const { mutate: mutatePrepareBooking, isPending: loadingPrepareBooking } =
    useMutationPrepareBooking();

  const latitude = useWatch({ control: form.control, name: "latitude" });
  const longitude = useWatch({ control: form.control, name: "longitude" });
  const coupon_id = useWatch({ control: form.control, name: "coupon_id" });

  useEffect(() => {
    if (item && latitude && longitude) {
      mutatePrepareBooking(
        {
          category_id: item!.service.category_id,
          option_id: item!.service.price_id,
          ktv_id: item!.ktv.id,
          latitude,
          longitude,
          coupon_id: coupon_id || null,
        },
        {
          onSuccess: (res) => {
            setDataPricing(res.data);
            setError(null);
          },
          onError: (err) => {
            const message = getMessageError(err, t);
            setError(message || t("common_error.unknown_error"));
            setDataPricing(null);
          },
        },
      );
    }
  }, [latitude, longitude, item, t]);

  const handleBookingService = useCallback(
    (data: BookingServiceRequest) => {
      setLoading(true);
      mutateBookingService(data, {
        onSuccess: (res) => {
          setBookingId(res.data.booking_id);
          router.push("/service-booking-result");
        },
        onError: (err) => {
          const message = getMessageError(err, t);
          setError(message || t("common_error.unknown_error"));
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    },
    [mutateBookingService, router, setBookingId, setLoading, t],
  );

  useEffect(() => {
    setLoading(loadingBookingService || loadingPrepareBooking);
  }, [loadingBookingService, loadingPrepareBooking]);

  return {
    item,
    userLocation,
    queryCoupon,
    form,
    dataPricing,
    error,
    handleBookingService,
  };
};
