import { useEffect, useMemo } from "react";
import { debounce } from "lodash";
import type { DebouncedFunc } from "lodash";

const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
): DebouncedFunc<T> => {
  const debouncedCallback = useMemo(() => {
    return debounce((...args: any[]) => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback;
};

export default useDebounce;
