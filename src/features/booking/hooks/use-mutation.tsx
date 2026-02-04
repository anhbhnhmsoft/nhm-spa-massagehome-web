import { useMutation } from "@tanstack/react-query";

import bookingApi from "@/features/booking/api";
import { CancelBookingRequest } from "../types";

export const useCancelBookingCustomerMutation = () => {
  return useMutation({
    mutationFn: (data: CancelBookingRequest) => bookingApi.cancelBooking(data),
  });
};
