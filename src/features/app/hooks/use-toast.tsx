"use client";

import { toast } from "sonner";
import { useCallback } from "react";
import { ToastType, useModalToastStore } from "@/components/toast-manger-modal";

type SetMessage = {
  title?: string;
  message: string;
};

const useToast = (forModal: boolean = false) => {
  const showModalToast = useModalToastStore((state) => state.show);

  const show = useCallback(
    (type: ToastType, set: SetMessage) => {
      if (forModal) {
        // MODAL TOAST (giữ logic của bạn)
        showModalToast(type, set);
        return;
      }

      // APP TOAST (UI DEFAULT SONNER)
      const content = set.title ? `${set.title}\n${set.message}` : set.message;

      switch (type) {
        case "success":
          toast.success(content);
          break;
        case "error":
          toast.error(content);
          break;
        case "warn":
          toast.warning(content);
          break;
        case "info":
          toast.info(content);
          break;
      }
    },
    [forModal, showModalToast],
  );

  return {
    success: (set: SetMessage) => show("success", set),
    error: (set: SetMessage) => show("error", set),
    warning: (set: SetMessage) => show("warn", set),
    info: (set: SetMessage) => show("info", set),
  };
};

export default useToast;
