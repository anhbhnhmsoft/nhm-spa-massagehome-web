import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ContractFileType } from "@/features/file/const";
import useApplicationStore from "@/lib/store";

export const usePreviewPdf = () => {
  const router = useRouter();

  const setContractType = useApplicationStore((state) => state.setContractType);
  const handlePreviewPdf = useCallback(
    async (type: ContractFileType) => {
      await setContractType(type);
      router.push("/term-or-use-pdf");
    },
    [router, setContractType],
  );

  return {
    handlePreviewPdf,
  };
};
