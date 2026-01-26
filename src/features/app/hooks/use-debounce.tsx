"use client";

import { useEffect, useMemo } from "react";
import { debounce } from "lodash";

const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  deps: any[] = [],
): T => {
  const debouncedCallback = useMemo(() => {
    return debounce(callback, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...deps]);

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback as T;
};

export default useDebounce;
