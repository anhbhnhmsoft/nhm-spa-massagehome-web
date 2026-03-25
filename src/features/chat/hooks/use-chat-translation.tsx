import { useCallback, useState } from "react";
import { useMutationTranslateMessage } from "./use-mutation";
import { _LanguageCode } from "@/lib/const";
import { _DEFAULT_TRANSLATIONS, LanguageTranslations } from "@/lib/types";
import { ListMessageResponse, PayloadNewMessage } from "../types";
import { useImmer } from "use-immer";
import { queryClient } from "@/lib/provider/query-provider";
import { InfiniteData } from "@tanstack/react-query";
import useChatStore from "../stores";
import { produce } from "immer";

export const useChatTranslation = () => {
  const [chatItemSelected, setChatItemSelected] =
    useState<PayloadNewMessage | null>(null);

  const [visibleSelectLang, setVisibleSelectLang] = useState(false);

  const { mutate: translateMutate } = useMutationTranslateMessage();
  const [targetLang, setTargetLang] = useState<_LanguageCode | null>(null);

  const [translatedChat, setTranslatedChat] = useImmer<LanguageTranslations>(
    _DEFAULT_TRANSLATIONS,
  );

  const room = useChatStore((s) => s.room);

  const setItemTranslating = useCallback(
    (messageId: string, loading: boolean) => {
      if (!room?.id) return;

      queryClient.setQueryData<InfiniteData<ListMessageResponse>>(
        ["chatApi-listMessages", room.id],
        (oldData) => {
          if (!oldData) return oldData;

          return produce(oldData, (draft) => {
            for (const page of draft.pages) {
              const msgs = page.data?.data;
              if (!msgs) continue;

              const msg = msgs.find(
                (item: PayloadNewMessage) => item.id === messageId,
              );

              if (msg) {
                msg.isTranslating = loading;
                break;
              }
            }
          });
        },
      );
    },
    [room],
  );

  // Cập nhật bản dịch vào cache + tắt loading
  const handleUpdateTranslation = useCallback(
    (messageId: string, translated: string, lang: _LanguageCode) => {
      if (!room?.id) return;

      queryClient.setQueryData<InfiniteData<ListMessageResponse>>(
        ["chatApi-listMessages", room.id],
        (oldData) => {
          if (!oldData) return oldData;

          return produce(oldData, (draft) => {
            for (const page of draft.pages) {
              const msgs = page.data?.data;
              if (!msgs) continue;

              const msg = msgs.find(
                (item: PayloadNewMessage) => item.id === messageId,
              );

              if (msg) {
                msg.translated_content = translated;
                msg.target_lang_translated = lang;
                msg.isTranslating = false;
                break;
              }
            }
          });
        },
      );
    },
    [room],
  );

  // Hàm dịch chính — luôn nhận item trực tiếp, không dùng state
  const translate = useCallback(
    (
      lang: _LanguageCode,
      item: PayloadNewMessage,
      cache: LanguageTranslations,
    ) => {
      if (!item.content || item.content.trim().length === 0) return;

      // Đã có trong cache → dùng luôn, không gọi API
      if (cache[lang] && cache[lang].length > 0) {
        handleUpdateTranslation(item.id, cache[lang], lang);
        return;
      }

      // Bật loading trên item
      setItemTranslating(item.id, true);

      translateMutate(
        { message_id: item.id, lang },
        {
          onSuccess: ({ data }) => {
            const text = data.translate;
            setTranslatedChat((draft) => {
              draft[lang] = text;
            });
            handleUpdateTranslation(item.id, text, lang);
          },
          onError: () => {
            setItemTranslating(item.id, false);
          },
        },
      );
    },
    [
      translateMutate,
      handleUpdateTranslation,
      setItemTranslating,
      setTranslatedChat,
    ],
  );

  // Bấm "Xem bản dịch" trên tin nhắn
  const handleTranslateMessage = useCallback(
    (item: PayloadNewMessage) => {
      let newCache = translatedChat;

      if (item.content_translated) {
        setTranslatedChat(item.content_translated);
        newCache = item.content_translated;
      } else if (item.target_lang_translated && item.translated_content) {
        const lang = item.target_lang_translated;
        const text = item.translated_content;
        setTranslatedChat((draft) => {
          draft[lang] = text;
        });
        newCache = { ...translatedChat, [lang]: text };
      } else {
        setTranslatedChat(_DEFAULT_TRANSLATIONS);
        newCache = _DEFAULT_TRANSLATIONS;
      }

      setChatItemSelected(item);

      if (!targetLang) {
        setVisibleSelectLang(true);
        return;
      }

      // Đã có ngôn ngữ → dịch luôn
      translate(targetLang, item, newCache);
    },
    [targetLang, translate, translatedChat, setTranslatedChat],
  );

  // Chọn ngôn ngữ trong modal → lưu lang + dịch luôn
  const handleChangeTargetLang = useCallback(
    (lang: _LanguageCode) => {
      setTargetLang(lang);
      setVisibleSelectLang(false);

      if (chatItemSelected) {
        translate(lang, chatItemSelected, translatedChat);
      }
    },
    [translate, chatItemSelected, translatedChat],
  );

  // Bấm icon Settings → lưu item + mở modal đổi ngôn ngữ
  const handleChangeLanguageForMessage = useCallback(
    (item: PayloadNewMessage) => {
      setChatItemSelected(item);
      setVisibleSelectLang(true);
    },
    [],
  );

  // Ẩn bản dịch
  const handleHideTranslation = useCallback(
    (messageId: string) => {
      if (!room?.id) return;

      queryClient.setQueryData<InfiniteData<ListMessageResponse>>(
        ["chatApi-listMessages", room.id],
        (oldData) => {
          if (!oldData) return oldData;

          return produce(oldData, (draft) => {
            for (const page of draft.pages) {
              const msgs = page.data?.data;
              if (!msgs) continue;

              const msg = msgs.find(
                (item: PayloadNewMessage) => item.id === messageId,
              );

              if (msg) {
                msg.translated_content = undefined;
                msg.target_lang_translated = undefined;
                break;
              }
            }
          });
        },
      );
    },
    [room],
  );

  const handleCloseModalLang = useCallback(() => {
    setVisibleSelectLang(false);
  }, []);

  return {
    targetLang,
    modalLangVisible: visibleSelectLang,

    handleTranslateMessage,
    handleChangeLanguageForMessage,
    handleHideTranslation,
    handleChangeTargetLang,
    handleCloseModalLang,
  };
};
