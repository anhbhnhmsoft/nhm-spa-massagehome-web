import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { _KTVConfigSchedules, _LanguageCode } from "./const";
import ErrorAPIServer from "./types";
import { TFunction } from "i18next";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const checkLanguage = (lang: string) => {
  return [_LanguageCode.EN, _LanguageCode.VI, _LanguageCode.CN].includes(
    lang as _LanguageCode,
  );
};

// nhân bản list ở home page
export function normalizeListToLength<T>(list: T[], targetLength: number): T[] {
  if (list.length === 0) return [];

  const result: T[] = [];
  let index = 0;

  while (result.length < targetLength) {
    result.push(list[index % list.length]);
    index++;
  }

  return result;
}

// Hàm chuyển đổi độ sang radian
const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

/**
 * Tính khoảng cách giữa 2 tọa độ theo công thức Haversine
 * @param lat1 Vĩ độ người dùng
 * @param lon1 Kinh độ người dùng
 * @param lat2 Vĩ độ Provider
 * @param lon2 Kinh độ Provider
 * @returns Khoảng cách (km)
 */
export const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Khoảng cách theo km
  return R * c;
};

// Hàm helper để format hiển thị (VD: 1.5 km, 500 m)
export const formatDistance = (distanceInKm: number) => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
};

/**
 * Lấy thông báo lỗi từ server
 * @param err Đối tượng lỗi
 * @param t Hàm dịch chuỗi
 * @returns Thông báo lỗi
 */
export const getMessageError = (
  err: Error | ErrorAPIServer | any,
  t: TFunction,
) => {
  if (err) {
    if (err instanceof ErrorAPIServer) {
      if (err.validateError) {
        const validationErrors = err.validateError;
        const firstKey = Object.keys(validationErrors)[0];
        const firstValue = validationErrors[firstKey];
        return firstValue[0];
      } else if (err.message) {
        return err.message;
      }
    } else {
      return t("common_error.unknown_error");
    }
  }
};

// Hàm format tiền tệ
export const formatBalance = (balance: string | number) => {
  return Number(balance).toLocaleString("vi-VN");
};

// Lấy khóa ngày hiện tại trong cấu hình KTV
export const getCurrentDayKey = () => {
  const day = dayjs().day(); // 0 là Chủ nhật, 1 là Thứ 2
  if (day === 0) return _KTVConfigSchedules.SUNDAY; // 0 -> 8
  return day + 1; // 1 -> 2 (Thứ 2), 6 -> 7 (Thứ 7)
};
