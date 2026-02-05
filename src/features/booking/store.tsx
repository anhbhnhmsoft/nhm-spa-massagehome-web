import { create } from "zustand";
import { _BookingStatus } from "../service/const";

interface OrdersState {
  status: _BookingStatus | null;
  setStatus: (status: _BookingStatus | null) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  status: null,
  setStatus: (status) => {
    set({ status });
  },
}));
