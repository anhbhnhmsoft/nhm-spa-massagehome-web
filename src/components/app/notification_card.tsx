"use client";

import React from "react";
import {
  NotificationStatus,
  NotificationType,
} from "@/features/notification/const";
import { Bell, CalendarDays, CreditCard } from "lucide-react"; // Dùng bản lucide-react cho Web
import { Notification } from "@/features/notification/type";
import dayjs from "dayjs";
import "dayjs/locale/vi";

// Hàm lấy icon và màu sắc
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.PAYMENT_COMPLETE:
      return {
        icon: <CreditCard size={20} className="text-[#044984]" />,
        bgColor: "bg-blue-100", // Thay bằng biến color config của bạn nếu cần
      };
    case NotificationType.NEW_BOOKING_REQUEST:
    case NotificationType.BOOKING_SUCCESS:
      return {
        icon: <CalendarDays size={20} className="text-[#2B7BBE]" />,
        bgColor: "bg-blue-50",
      };
    default:
      return {
        icon: <Bell size={20} className="text-[#45556C]" />,
        bgColor: "bg-gray-100",
      };
  }
};

interface NotificationItemProps {
  item: Notification;
  onRead: (id: string) => void;
}

export default function NotificationItem({
  item,
  onRead,
}: NotificationItemProps) {
  const config = getNotificationIcon(item.type);
  const isUnread = item.status !== NotificationStatus.READ;

  return (
    <button
      onClick={() => onRead(item.id.toString())}
      className={`flex w-full flex-row border-b border-gray-100 p-4 transition-colors text-left
        ${isUnread ? "bg-blue-50/30" : "bg-white hover:bg-gray-50"}`}
    >
      {/* Icon Left */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex flex-row items-start justify-between">
          <h4
            className={`truncate pr-2 text-[15px] ${
              isUnread
                ? "font-semibold text-gray-900"
                : "font-medium text-gray-700"
            }`}
          >
            {item.title}
          </h4>
          {isUnread && (
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {item.description}
        </p>

        <time className="mt-2 block text-[11px] text-gray-400">
          {dayjs(item.created_at).locale("vi").format("DD/MM/YYYY • HH:mm")}
        </time>
      </div>
    </button>
  );
}
