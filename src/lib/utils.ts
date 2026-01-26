import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { _LanguageCode } from "./const";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const checkLanguage = (lang: string) => {
  return [_LanguageCode.EN, _LanguageCode.VI, _LanguageCode.CN].includes(
    lang as _LanguageCode,
  );
};

// nhân bản list ở home page
export  function normalizeListToLength<T>(list: T[], targetLength: number): T[]{
  if (list.length === 0) return [];

  const result: T[] = [];
  let index = 0;

  while (result.length < targetLength) {
    result.push(list[index % list.length]);
    index++;
  }

  return result;
}
