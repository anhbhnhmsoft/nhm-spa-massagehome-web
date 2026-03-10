import { useMutation } from "@tanstack/react-query";
import { fileApi } from "../api";

export const useDownloadFile = () => {
  return useMutation({
    mutationFn: (type: number) => fileApi.getContractFile(type),
  });
};
