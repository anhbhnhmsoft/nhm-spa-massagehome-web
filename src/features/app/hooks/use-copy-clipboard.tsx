import { useCallback } from "react";
import useToast from "./use-toast";
import { useTranslation } from "react-i18next";

export default function useCopyClipboard() {
  const { t } = useTranslation();
  const { success, error } = useToast();
  const copy = useCallback(
    (text: string) => {
      if (!text) return;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          success({ message: t("common_success.copied_to_clipboard") });
        })
        .catch(() => {
          error({ message: "Lỗi khi sao chép" });
        });
    },
    [error, success, t],
  );

  return copy;
}
