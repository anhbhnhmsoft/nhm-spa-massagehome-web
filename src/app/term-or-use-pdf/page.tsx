"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useGetFileQuery } from "@/features/file/hooks/use-query";
import useApplicationStore from "@/lib/store";
import { useTranslation } from "react-i18next";

export default function TermOrUsePdf() {
  const router = useRouter();
  const contractType = useApplicationStore((s) => s.contractType);
  const clearContractType = useApplicationStore((s) => s.clearContractType);
  const { t } = useTranslation();
  const [pdfLoading, setPdfLoading] = useState(true);

  const { data, isLoading } = useGetFileQuery(contractType ?? undefined);
  useEffect(() => {
    if (contractType === null) {
      router.replace("/");
    }
  }, [contractType, router]);

  if (contractType === null) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-inter">
      {/* Header */}
      <header className="flex h-16 items-center border-b bg-white px-4 md:px-8">
        <button
          onClick={() => {
            clearContractType();
            router.back();
          }}
          className="flex items-center gap-2 rounded-xl p-2 transition-all hover:bg-gray-100 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
          <span className="font-bold text-gray-700">{t("common.back")}</span>
        </button>
      </header>

      {/* Content */}
      <main className="relative flex-1 p-2 md:p-6">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary-color-2" />
          </div>
        ) : (
          <div className="relative mx-auto h-full w-full max-w-[1024px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {data?.file ? (
              <iframe
                src={`${data.file}#toolbar=0`}
                className="h-full w-full"
                onLoad={() => setPdfLoading(false)}
                title="PDF Viewer"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-medium text-gray-500">
                {t("common.document.not_found")}
              </div>
            )}

            {pdfLoading && data?.file && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary-color-2" />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
