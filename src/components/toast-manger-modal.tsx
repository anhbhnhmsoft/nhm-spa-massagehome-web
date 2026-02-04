"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toastBg } from "./ui/toast-colors";

import { create } from "zustand";

export type ToastType = "success" | "error" | "warn" | "info";

export type ToastParams = {
  title?: string;
  message: string;
};

interface ModalToastState {
  toastConfig: { type: ToastType; title?: string; message: string } | null;
  show: (type: ToastType, params: ToastParams) => void;
  hide: () => void;
}

export const useModalToastStore = create<ModalToastState>((set) => ({
  toastConfig: null,
  show: (type, params) => set({ toastConfig: { type, ...params } }),
  hide: () => set({ toastConfig: null }),
}));

export const ModalToast = ({ children }: { children: React.ReactNode }) => {
  const toastConfig = useModalToastStore((s) => s.toastConfig);
  const hide = useModalToastStore((s) => s.hide);

  // Auto hide
  useEffect(() => {
    if (!toastConfig) return;
    const timer = setTimeout(hide, 2500);
    return () => clearTimeout(timer);
  }, [toastConfig, hide]);

  return (
    <>
      {children}

      {/* Toast layer */}
      <AnimatePresence>
        {toastConfig && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 400,
            }}
            className={`
              absolute z-[9999]
              top-4 right-4
              w-[calc(100%-2rem)]
              sm:max-w-md
              rounded-xl p-4
              shadow-xl
              text-white
              ${toastBg[toastConfig.type]}
            `}
            onClick={hide}
          >
            {toastConfig.title && (
              <p className="font-semibold text-sm mb-1">{toastConfig.title}</p>
            )}
            <p className="text-sm leading-snug">{toastConfig.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
