"use client";

import React, { useState, Suspense } from "react"; // Thêm Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useGetFileQuery } from "@/features/file/hooks/use-query";

// Tách phần nội dung sử dụng SearchParams ra một component con
function PdfContent() {
  const searchParams = useSearchParams();

  // Xử lý an toàn: lấy giá trị type, nếu null thì mặc định là chuỗi rỗng
  const type = searchParams?.get("type") || "";

  const contractType = Number(type);
  const { data, isLoading } = useGetFileQuery(contractType);
  const [pdfLoading, setPdfLoading] = useState(true);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-color-2" />
      </div>
    );
  }

  return (
    <div className="mx-auto h-full w-full max-w-[1024px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {data?.file ? (
        <iframe
          src={`${data.file}#toolbar=0`}
          className="h-full w-full"
          onLoad={() => setPdfLoading(false)}
          title="PDF Viewer"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500 font-medium">
          Không tìm thấy tài liệu phù hợp
        </div>
      )}

      {pdfLoading && data?.file && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary-color-2" />
        </div>
      )}
    </div>
  );
}

// Component chính
export default function TermOrUsePdf() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-inter">
      {/* Header */}
      <header className="flex h-16 items-center border-b bg-white px-4 md:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl p-2 transition-all hover:bg-gray-100 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
          <span className="font-bold text-gray-700">Quay lại</span>
        </button>
      </header>

      {/* Container chính với Suspense */}
      <main className="relative flex-1 p-2 md:p-6">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary-color-2" />
            </div>
          }
        >
          <PdfContent />
        </Suspense>
      </main>
    </div>
  );
}
