import { useCallback } from "react";
import { getDistanceFromLatLonInKm } from "@/lib/utils";
import useApplicationStore from "@/lib/store";

const useCalculateDistance = () => {
  const userLocation = useApplicationStore((state) => state.location);

  return useCallback(
    (latProvider: number, lonProvider: number) => {
      if (userLocation) {
        return getDistanceFromLatLonInKm(
          userLocation.location?.coords.latitude ?? 0,
          userLocation.location?.coords.longitude ?? 0,
          latProvider,
          lonProvider,
        );
      } else {
        return 0;
      }
    },
    [userLocation],
  );
};

export default useCalculateDistance;
