"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { PayloadNewMessage } from "@/features/chat/types";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  AlertCircle,
  ChevronLeft,
  Send,
  Loader2,
  Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useChat } from "@/features/chat/hooks";
import SelectLanguageTranslate from "./select-language-tranlate";
import { TFunction } from "i18next";
import { useChatTranslation } from "@/features/chat/hooks/use-chat-translation";

const MessageItem = ({
  item,
  currentUserId,
  onTranslate,
  onHideTranslation,
  onChangeLanguage,
  t,
}: {
  item: PayloadNewMessage;
  currentUserId: string;
  onTranslate: (msg: PayloadNewMessage) => void;
  onHideTranslation: (id: string) => void;
  onChangeLanguage: (msg: PayloadNewMessage) => void;
  t: TFunction;
}) => {
  const isMe = item.sender_id === currentUserId;

  return (
    <div
      className={cn(
        "my-2 px-4 w-full flex",
        isMe ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm",
          isMe
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-200 text-black rounded-bl-none",
        )}
      >
        {/* Nội dung gốc */}
        <p className="text-[15px] whitespace-pre-wrap">{item.content}</p>

        {/* Button xem bản dịch */}
        {!item.translated_content && !item.isTranslating && (
          <button
            onClick={() => onTranslate(item)}
            className="text-xs mt-1 underline opacity-70 hover:opacity-100"
          >
            {t("chat.view_translation")}
          </button>
        )}

        {/* Loading spinner khi đang dịch */}
        {item.isTranslating && (
          <div className="flex items-center gap-1.5 mt-2">
            <Loader2
              size={12}
              className={cn(
                "animate-spin",
                isMe ? "text-blue-200" : "text-gray-400",
              )}
            />
            <span
              className={cn(
                "text-xs",
                isMe ? "text-blue-200" : "text-gray-400",
              )}
            >
              {t("chat.translating")}
            </span>
          </div>
        )}

        {/* Bản dịch */}
        {item.translated_content && !item.isTranslating && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <p
              className={cn(
                "text-[14px] italic",
                isMe ? "text-blue-100" : "text-gray-600",
              )}
            >
              — {item.translated_content}
            </p>

            <div className="flex items-center justify-between mt-1">
              <button
                onClick={() => onHideTranslation(item.id)}
                className="text-xs underline opacity-70"
              >
                {t("chat.hide_translation")}
              </button>

              <button
                onClick={() => onChangeLanguage(item)}
                className="p-1 rounded-full hover:bg-black/10"
                title={t("chat.change_language")}
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Time + status */}
        <div className="flex justify-end mt-1 gap-1 opacity-70">
          <span className="text-[10px]">
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {isMe && (
            <>
              {item.status_sent === "pending" && (
                <Clock size={12} className="animate-pulse" />
              )}
              {item.status_sent === "sent" && <Check size={12} />}
              {item.status_sent === "failed" && (
                <AlertCircle size={12} className="text-red-300" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
MessageItem.displayName = "MessageItem";

export default function ChatViewScreen({
  useFor,
}: {
  useFor: "ktv" | "customer";
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [inputText, setInputText] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  const prevMessageCountRef = useRef(0);
  const prevScrollHeightRef = useRef(0);

  const { messages, submitMessage, joinStatus, historyQuery, user, room } =
    useChat(useFor);

  const {
    targetLang,
    modalLangVisible,
    handleTranslateMessage,
    handleChangeLanguageForMessage,
    handleHideTranslation,
    handleChangeTargetLang,
    handleCloseModalLang,
  } = useChatTranslation();

  useEffect(() => {
    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    if (currentCount > prevCount) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messages]);

  useEffect(() => {
    if (historyQuery.isFetchingNextPage) {
      prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? 0;
    } else if (prevScrollHeightRef.current > 0 && scrollRef.current) {
      const newScrollHeight = scrollRef.current.scrollHeight;
      scrollRef.current.scrollTop =
        newScrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [historyQuery.isFetchingNextPage]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    submitMessage(inputText.trim());
    setInputText("");
  };

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

  const displayMessages = [...messages].reverse();

  return (
    <>
      <div className="flex flex-col h-screen w-full max-w-4xl mx-auto bg-white border-x shadow-lg">
        {/* HEADER */}
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

        {/* MESSAGE LIST */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-gray-50/50 flex flex-col p-2 md:p-4"
          onScroll={handleScroll}
        >
          {historyQuery.isFetchingNextPage && (
            <div className="py-4 flex justify-center w-full">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}

          <div className="mt-auto">
            {displayMessages.map((msg) => (
              <MessageItem
                key={msg.temp_id || msg.id}
                item={msg}
                currentUserId={user?.id || ""}
                onTranslate={handleTranslateMessage}
                onHideTranslation={handleHideTranslation}
                onChangeLanguage={handleChangeLanguageForMessage}
                t={t}
              />
            ))}
          </div>
        </div>

        {/* INPUT BAR */}
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
              <Send
                size={20}
                fill={inputText.trim() ? "currentColor" : "none"}
              />
            </button>
          </form>
        </footer>
      </div>

      <SelectLanguageTranslate
        visible={modalLangVisible}
        onClose={handleCloseModalLang}
        selectedLang={targetLang}
        setLanguage={handleChangeTargetLang}
      />
    </>
  );
}
