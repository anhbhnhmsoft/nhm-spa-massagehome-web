import { useMutation } from "@tanstack/react-query";

import bookingApi from "@/features/booking/api";
import {
  BookingServiceRequest,
  CancelBookingRequest,
  PrepareBookingRequest,
} from "../types";

export const useCancelBookingCustomerMutation = () => {
  return useMutation({
    mutationFn: (data: CancelBookingRequest) => bookingApi.cancelBooking(data),
  });
};

/**
 * Lấy thông tin trước khi đặt lịch dịch vụ
 */
export const useMutationPrepareBooking = () => {
  return useMutation({
    mutationFn: (data: PrepareBookingRequest) =>
      bookingApi.prepareBooking(data),
  });
};

/**
 * Đặt lịch hẹn dịch vụ
 */
export const useMutationBookingService = () => {
  return useMutation({
    mutationFn: (data: BookingServiceRequest) => bookingApi.booking(data),
  });
};
