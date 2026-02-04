"use client";

import useApplicationStore, { LocationApp } from "@/lib/store";
import { useEffect, useState, useCallback } from "react";

export type WebPermissionState = "granted" | "denied" | "prompt" | null;
/**
 * Hàm fetch vị trí và format địa chỉ qua Nominatim
 */
export const fetchAndFormatLocation = async (): Promise<LocationApp> => {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Trình duyệt không hỗ trợ Geolocation");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
    });
  });

  const { latitude, longitude, accuracy } = position.coords;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
    {
      headers: {
        "Accept-Language": "vi",
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
 * Hook chính: Quản lý quyền và tự động lấy vị trí
 */
export const useLocation = () => {
  const setLocation = useApplicationStore((s) => s.setLocation);

  const [completeCheck, setCompleteCheck] = useState(false);
  // Sử dụng PermissionState chuẩn (granted | denied | prompt)
  const [locationPermission, setLocationPermission] =
    useState<PermissionState | null>(null);

  const handleFetch = useCallback(async () => {
    try {
      const locationData = await fetchAndFormatLocation();
      setLocation(locationData);
    } catch (error) {
      console.error("Location Fetch Error:", error);
    }
  }, [setLocation]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let permissionObj: PermissionStatus | null = null;

    const checkAndSubscribe = async () => {
      try {
        if (!navigator.permissions || !navigator.geolocation) {
          setCompleteCheck(true);
          return;
        }

        permissionObj = await navigator.permissions.query({
          name: "geolocation",
        });

        const updateState = async () => {
          if (!permissionObj) return;

          const currentState = permissionObj.state; // Đây là kiểu PermissionState
          setLocationPermission(currentState);

          if (currentState === "granted") {
            await handleFetch();
          }
          setCompleteCheck(true);
        };

        // Chạy lần đầu
        await updateState();

        // Lắng nghe thay đổi
        permissionObj.onchange = updateState;
      } catch (err) {
        console.error("Permission Check Error:", err);
        setCompleteCheck(true);
      }
    };

    checkAndSubscribe();

    return () => {
      if (permissionObj) permissionObj.onchange = null;
    };
  }, [handleFetch]);

  return {
    locationPermission,
    completeCheck,
    refresh: handleFetch,
  };
};

export const useGetLocation = () => {
  const setLocation = useApplicationStore((s) => s.setLocation);

  const getPermission = useCallback(async () => {
    try {
      if (!navigator.geolocation) return false;

      const locationApp = await fetchAndFormatLocation();
      setLocation(locationApp);

      return true;
    } catch (error) {
      console.error("Get location failed:", error);
      return false;
    }
  }, [setLocation]);

  return {
    getPermission,
  };
};

/**
 * Hook đơn giản: Chỉ lấy dữ liệu từ store và trạng thái quyền hiện tại
 */
export const useLocationAddress = () => {
  const location = useApplicationStore((s) => s.location);
  const [permission, setPermission] = useState<WebPermissionState>(null);

  useEffect(() => {
    if (!navigator.permissions) return;

    let mounted = true;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (!mounted) return;

        setPermission(result.state);

        result.onchange = () => {
          setPermission(result.state);
        };
      })
      .catch(() => {
        // optional: giữ null
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    location,
    permission,
  };
};
