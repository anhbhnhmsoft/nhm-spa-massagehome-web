"use client";

import React, { useRef, useState, useEffect } from "react";
import { PayloadNewMessage } from "@/features/chat/types";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  AlertCircle,
  ChevronLeft,
  Send,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useChat } from "@/features/chat/hooks";

// --- COMPONENT: TIN NHẮN ĐƠN LẺ ---
const MessageItem = React.memo(
  ({
    item,
    currentUserId,
  }: {
    item: PayloadNewMessage;
    currentUserId: string;
  }) => {
    const isMe = item.sender_id === currentUserId;

    return (
      <div
        className={cn(
          "my-2 px-4 w-full flex flex-row",
          isMe ? "justify-end" : "justify-start",
        )}
      >
        <div
          className={cn(
            "max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm transition-all",
            isMe
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-200 text-black rounded-bl-none",
          )}
        >
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
            {item.content}
          </p>

          <div className="flex items-center justify-end mt-1 gap-1 opacity-70">
            <span
              className={cn(
                "text-[10px]",
                isMe ? "text-blue-100" : "text-gray-500",
              )}
            >
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {isMe && (
              <div className="flex items-center">
                {item.status_sent === "pending" && (
                  <Clock size={12} className="animate-pulse" />
                )}
                {item.status_sent === "sent" && <Check size={12} />}
                {item.status_sent === "failed" && (
                  <AlertCircle size={12} className="text-red-300" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
MessageItem.displayName = "MessageItem";

// --- MAIN COMPONENT: MÀN HÌNH CHAT ---
export default function ChatViewScreen({
  useFor,
}: {
  useFor: "ktv" | "customer";
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [inputText, setInputText] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, submitMessage, joinStatus, historyQuery, user, room } =
    useChat(useFor);

  // 1. Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 2. Xử lý gửi tin nhắn
  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    submitMessage(inputText.trim());
    setInputText("");
  };

  // 3. Xử lý tải thêm tin nhắn cũ khi cuộn lên đỉnh (Infinite Scroll)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (
      scrollTop === 0 &&
      historyQuery.hasNextPage &&
      !historyQuery.isFetchingNextPage
    ) {
      historyQuery.fetchNextPage();
    }
  };

  // 4. Màn hình Loading khi đang kết nối
  if (
    joinStatus === "joining" ||
    (joinStatus === "pending" && historyQuery.isLoading)
  ) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500 mt-2 font-medium">{t("chat.connecting")}</p>
      </div>
    );
  }

  // Chú ý: Nếu mảng `messages` trả về từ hook có tin mới nhất ở index 0,
  // chúng ta cần .reverse() nó lại để hiển thị xuôi từ trên xuống dưới.
  const displayMessages = [...messages].reverse();

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto bg-white border-x shadow-lg">
      {/* --- HEADER --- */}
      <header className="flex items-center p-4 border-b bg-white sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => router.back()}
          className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg text-gray-800 truncate">
            {room?.partner_name || "Chat Room"}
          </h1>
        </div>
      </header>

      {/* --- MESSAGE LIST (Scroll xuôi) --- */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-gray-50/50 flex flex-col p-2 md:p-4"
        onScroll={handleScroll}
      >
        {/* Loading khi tải tin nhắn cũ (hiện ở trên cùng) */}
        {historyQuery.isFetchingNextPage && (
          <div className="py-4 flex justify-center w-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}

        <div className="mt-auto">
          {" "}
          {/* Đẩy tin nhắn xuống đáy nếu danh sách còn ngắn */}
          {displayMessages.map((msg) => (
            <MessageItem
              key={msg.temp_id || msg.id}
              item={msg}
              currentUserId={user?.id || ""}
            />
          ))}
        </div>
      </div>

      {/* --- INPUT BAR --- */}
      <footer className="p-4 bg-white border-t border-gray-100">
        <form
          onSubmit={handleSend}
          className="flex items-end gap-3 max-w-4xl mx-auto"
        >
          <div className="flex-1 relative">
            <textarea
              rows={1}
              className="w-full bg-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none max-h-32 text-[15px] border-none shadow-inner"
              placeholder={t("chat.placeholder") || "Nhập tin nhắn..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all transform active:scale-90 shadow-md",
              inputText.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed",
            )}
          >
            <Send size={20} fill={inputText.trim() ? "currentColor" : "none"} />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-400 mt-2">
          Nhấn Enter để gửi, Shift + Enter để xuống dòng
        </p>
      </footer>
    </div>
  );
}
