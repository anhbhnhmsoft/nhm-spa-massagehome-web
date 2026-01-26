"use client";

import useApplicationStore, { LocationApp } from "@/lib/store";
import { useEffect, useState, useCallback } from "react";

// Định nghĩa lại Type chính xác
export type PermissionState = "granted" | "denied" | "undetermined" | null;

/**
 * Hàm fetch vị trí và format địa chỉ
 */
export const fetchAndFormatLocation = async (): Promise<LocationApp> => {
  if (typeof window !== "undefined" && !navigator.geolocation) {
    throw new Error("Trình duyệt không hỗ trợ Geolocation");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false, // Balanced
      timeout: 10000,
    });
  });

  const { latitude, longitude, accuracy } = position.coords;

  // Reverse geocode qua Nominatim (OpenStreetMap)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
    {
      headers: {
        "Accept-Language": "vi", // Ưu tiên trả về tiếng Việt
      },
    },
  );
  if (!res.ok) throw new Error("Không thể lấy địa chỉ từ tọa độ");

  const data = await res.json();

  return {
    location: {
      latitude,
      longitude,
      accuracy,
    },
    address: data?.display_name ?? "Địa chỉ không xác định",
  };
};

/**
 * Hook sử dụng vị trí
 */
export const useLocation = () => {
  const setLocation = useApplicationStore((s) => s.setLocation);

  const [completeCheck, setCompleteCheck] = useState(false);
  const [locationPermission, setLocationPermission] =
    useState<PermissionState>(null);

  // Hàm thực thi lấy dữ liệu vị trí
  const handleFetch = useCallback(async () => {
    try {
      const locationData = await fetchAndFormatLocation();
      setLocation(locationData);
    } catch (error) {
      console.error("Location Fetch Error:", error);
    }
  }, [setLocation]);
  console.log("completeCheck", completeCheck);
  useEffect(() => {
    if (typeof window === "undefined") return;

    let permissionStatus: PermissionStatus | null = null;

    const checkAndSubscribe = async () => {
      try {
        if (!navigator.permissions || !navigator.geolocation) {
          setCompleteCheck(true);
          return;
        }

        // Truy vấn quyền
        permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });

        const updateState = async () => {
          const state = permissionStatus?.state;
          let mapped: PermissionState = null;

          if (state === "granted") mapped = "granted";
          else if (state === "denied") mapped = "denied";
          else if (state === "prompt") mapped = "undetermined";

          setLocationPermission(mapped);

          // Nếu được cấp quyền, tự động lấy vị trí
          if (mapped === "granted") {
            await handleFetch();
          }
          setCompleteCheck(true);
        };

        // Chạy lần đầu
        await updateState();

        // Lắng nghe sự thay đổi (ví dụ: người dùng đổi từ Block sang Allow trong cài đặt)
        permissionStatus.onchange = updateState;
      } catch (err) {
        console.error("Permission Check Error:", err);
        setCompleteCheck(true);
      }
    };

    checkAndSubscribe();

    // Cleanup listener khi component unmount
    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [handleFetch]);

  return {
    locationPermission,
    completeCheck,
    refresh: handleFetch, // Cho phép gọi lại thủ công nếu cần
  };
};
