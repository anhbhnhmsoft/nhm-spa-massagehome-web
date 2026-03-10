import { useCallback } from "react";
import { ContractFileType } from "@/features/file/const";
import { useDownloadFile } from "@/features/file/hooks/use-mutation";

export const usePreviewPdf = () => {
  const { mutate } = useDownloadFile();
  const handlePreviewPdf = useCallback(
    async (type: ContractFileType) => {
      mutate(type, {
        onSuccess: (data) => {
          const fileUrl = data.data.file;
          if (!fileUrl) return;

          const link = document.createElement("a");
          link.href = fileUrl;
          link.target = "_blank"; // mở tab mới
          link.rel = "noopener noreferrer";

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        onError: (error) => {},
      });
    },
    [mutate],
  );

  return {
    handlePreviewPdf,
  };
};
