import { KTVDetail, ListKTVRequest } from "@/features/user/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type ForWho = "0" | "1";
interface IUserServiceStore {
  ktv: KTVDetail | null;
  forWho: ForWho;

  setKtv: (ktv: KTVDetail | null) => void;
  setForWho: (forWho: ForWho) => void;
}

const useUserServiceStore = create<IUserServiceStore>((set) => ({
  ktv: null,
  forWho: "0",

  setKtv: (ktv) => set({ ktv }),
  setForWho: (forWho) => set({ forWho }),
}));

export default useUserServiceStore;

/**
 * Store quản lý trạng thái tìm kiếm KTV
 */
const INITIAL_PARAMS: ListKTVRequest = {
  filter: {
    keyword: "",
  },
  page: 1,
  per_page: 10,
};
interface IKTVSearchStore {
  params: ListKTVRequest;
  // Actions
  setFilter: (filterPatch: Partial<ListKTVRequest["filter"]>) => void;
  setPage: (page: number) => void;
  resetParams: () => void;
}
export const useKTVSearchStore = create<IKTVSearchStore>()(
  immer((set) => ({
    params: INITIAL_PARAMS,
    setFilter: (filterPatch) =>
      set((draft) => {
        draft.params.page = 1;
        draft.params.filter = {
          ...draft.params.filter,
          ...filterPatch,
        };
      }),
    setPage: (page) =>
      set((draft) => {
        draft.params.page = page;
      }),
    resetParams: () =>
      set((draft) => {
        draft.params = INITIAL_PARAMS;
      }),
  })),
);
