"use client";

import { useEffect, useRef } from "react";
import useApplicationStore, { LocationApp } from "@/lib/store";
import { useMutationSetDefaultAddress } from "@/features/location/hooks/use-mutation";
import { useCheckAuth } from "@/features/auth/hooks";
import { _TIME_OUT_LOADING_SCREEN_LAYOUT } from "@/lib/const";

/**
 * Kiểm tra thay đổi vị trí đáng kể (~100m)
 */
const isSignificantChange = (
  oldLoc: GeolocationPosition | null,
  newLoc: GeolocationPosition,
) => {
  if (!oldLoc) return true;

  const threshold = 0.001;
  return (
    Math.abs(oldLoc.coords.latitude - newLoc.coords.latitude) > threshold ||
    Math.abs(oldLoc.coords.longitude - newLoc.coords.longitude) > threshold
  );
};

/**
 * Reverse geocode bằng OpenStreetMap
 */
const formatLocation = async (
  position: GeolocationPosition,
): Promise<LocationApp | null> => {
  try {
    const { latitude, longitude } = position.coords;
    if (!latitude || !longitude) {
      return null;
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          "Accept-Language": "vi",
        },
      },
    );

    const data = await res.json();
    if (!data?.address) return null;

    const addressParts = [
      data.address.road,
      data.address.suburb || data.address.city_district,
      data.address.city || data.address.state,
    ];

    return {
      location: position,
      address: addressParts.filter(Boolean).join(", "),
    };
  } catch {
    return null;
  }
};

/* ===================== MAIN HOOK ===================== */

/**
 * Hook theo dõi vị trí người dùng (global layout)
 */
export const useLocation = () => {
  const setAppLocation = useApplicationStore((s) => s.setLocation);

  const currentLocation = useRef<LocationApp | null>(null);
  const watchId = useRef<number | null>(null);
  const isStarting = useRef(false);

  const mutation = useMutationSetDefaultAddress();
  const checkAuth = useCheckAuth();

  /* ---------- Send location ---------- */
  const sendLocation = () => {
    if (!currentLocation.current || !checkAuth) return;
    if (!currentLocation.current.location) return;

    const oldLocation = useApplicationStore.getState().location;

    const shouldUpdate = isSignificantChange(
      oldLocation?.location ?? null,
      currentLocation.current.location,
    );

    if (!shouldUpdate) return;

    setAppLocation(currentLocation.current);

    mutation.mutate({
      address: currentLocation.current.address,
      latitude: currentLocation.current.location.coords.latitude,
      longitude: currentLocation.current.location.coords.longitude,
    });
  };

  /* ---------- Stop watch ---------- */
  const stopWatching = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  /* ---------- Start watch ---------- */
  const startWatching = () => {
    if (isStarting.current || watchId.current !== null) return;
    if (!("geolocation" in navigator)) return;

    isStarting.current = true;

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const location = await formatLocation(position);
        if (location) {
          currentLocation.current = location;
        }
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 1000 * 60,
        timeout: 10000,
      },
    );

    isStarting.current = false;
  };

  /* ---------- App visibility ---------- */
  useEffect(() => {
    startWatching();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startWatching();
      } else {
        stopWatching();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopWatching();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  /* ---------- Send interval ---------- */
  useEffect(() => {
    const timeoutId = setTimeout(sendLocation, _TIME_OUT_LOADING_SCREEN_LAYOUT);
    const intervalId = setInterval(sendLocation, 1000 * 60 * 5);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [checkAuth]);
};

/**
 * Lấy vị trí hiện tại khi user click button
 */
export const useGetLocation = () => {
  const setAppLocation = useApplicationStore((s) => s.setLocation);

  return async (): Promise<LocationApp | null> => {
    if (!("geolocation" in navigator)) return null;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = await formatLocation(position);
          if (location) setAppLocation(location);
          resolve(location);
        },
        () => resolve(null),
        { enableHighAccuracy: true },
      );
    });
  };
};
